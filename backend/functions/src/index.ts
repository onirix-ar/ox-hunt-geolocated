import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

const EMAIL_REG_EXP = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

const CONSTANTS = {
    COLLECTION_USERS: 'USERS',
    COLLECTION_SETTINGS: 'SETTINGS',
    APP_NAME: 'OxHunt',
    SECRET: 'JWT SECRET',
    ADMIN_ID: 'admin',
    // TODO Change SENDGRID_API_KEY
    SENDGRID_API_KEY: 'SENDGRID API KEY',
}

const regionalFunctions = functions.region('europe-west1');
admin.initializeApp();


/* FUNCTIONS */

export const saveScore = regionalFunctions.https.onCall(async (data, context) => {

    if (data.keepWarm) {
        return {};
    }

    const userId = await checkAuth(data.auth);

    // Validate input
    if (null == data.body || null == data.body.sceneOid || 1 > data.body.sceneOid.length) {
        throw new functions.https.HttpsError('invalid-argument', 'Scene id is required');
    }
    if (null == data.body || null == data.body.score || Number.isNaN(Number(data.body.score))) {
        throw new functions.https.HttpsError('invalid-argument', 'Score is required');
    }

    // Check that game is in progress
    const settings = await getOxHuntSettings();
    console.log(settings);
    if (!settings.scenes?.some(sceneOid => sceneOid === data.body.sceneOid)) {
        functions.logger.error('Unknown scene oid', settings, userId, data.body);
        throw new functions.https.HttpsError('permission-denied', 'Unknown game');
    }

    if (null == settings.periodStart || null == settings.periodEnd) {
        functions.logger.error('Games are closed (unknown settings)', settings, userId, data.body);
        throw new functions.https.HttpsError('permission-denied', 'Games are closed');
    }

    const periodStartTime = (new Date(settings.periodStart)).getTime();
    const currentTime = admin.firestore.Timestamp.now().toDate().getTime();
    const periodEndTime = (new Date(settings.periodEnd)).getTime();
    if ((currentTime < periodStartTime) || (periodEndTime < currentTime)) {
        functions.logger.error('Games are closed (period)', settings, userId, data.body, (new Date(currentTime)).toISOString());
        throw new functions.https.HttpsError('permission-denied', 'Games are closed');
    }

    try {
        let user: User = new User();
        await admin.firestore().runTransaction(async t => {
            const userRef = await admin.firestore().collection(CONSTANTS.COLLECTION_USERS).doc(userId);
            const userDoc = await t.get(userRef);
            if (!userDoc.exists) {
                functions.logger.error('User not found.', settings, userId, data.body);
                throw new functions.https.HttpsError('not-found', 'User not found.');
            }

            user = new User(userDoc.data());
            let currentScore = 0;
            if (null != user.playedGames && 0 < user.playedGames.length) {
                // Check that game is not played in this period
                let gameAlreadyPlayed: PlayedGame | null = null;
                user.playedGames.forEach( (g: PlayedGame) => {
                    const playedAtTime = (new Date(g.playedAt)).getTime();
                    if ((periodStartTime <= playedAtTime) && (playedAtTime <= currentTime)) {
                        if (g.sceneOid === data.body.sceneOid) {
                            gameAlreadyPlayed = g;
                        } else if (null == g.redeemedAt) {
                            currentScore += g.score;
                        }
                    }
                });

                if (null != gameAlreadyPlayed) {
                    functions.logger.error('Game already played.', settings, userId, data.body, gameAlreadyPlayed);
                    throw new functions.https.HttpsError('already-exists', 'Game already played.');
                }
            }

            const playedGame = {
                projectOid: settings.onirixProjectOid,
                sceneOid: data.body.sceneOid,
                playedAt: admin.firestore.Timestamp.now(),
                score: data.body.score
            }

            await t.update(userRef, { playedGames: admin.firestore.FieldValue.arrayUnion(playedGame) });
            user.playedGames.push(new PlayedGame(playedGame));
            user.score = currentScore + data.body.score;
            delete user.hash;
        });

        const response: {user: User, currentTier: Tier, nextTier: Tier} = {
            user: user,
            currentTier: null,
            nextTier: null 
        };
        const currentTierIndex: number = settings.tiers?.findIndex( tier => user.score && null != tier.min && (user.score >= tier.min)) || 0;

        if (0 <= currentTierIndex) {
            response.currentTier = settings.tiers[currentTierIndex];
            if (0 == currentTierIndex) {
                response.nextTier = null;    
            } else {
                response.nextTier = settings.tiers[currentTierIndex - 1];    
            }
        } else {
            response.nextTier = settings.tiers[settings.tiers.length - 1];
        }

        return response;
    } catch (error) {
        functions.logger.error(error, data);
        throw error;
    }
});

export const getUser = regionalFunctions.https.onCall(async (data, context) => {

    if (data.keepWarm) {
        return {};
    }

    const userId = await checkAuth(data.auth);

    const oxhuntSettings = await getOxHuntSettings();
    const user = await getOxHuntUser(userId, oxhuntSettings);

    return user;

});

/* Return project settings */
export const getSettings = regionalFunctions.https.onCall(async (data, context) => {

    if (data.keepWarm) {
        return {};
    }

    const userId = await checkAuth(data.auth);
    const settings = await getOxHuntSettings();
    delete settings.scenes;
    if (CONSTANTS.ADMIN_ID !== userId) {
        delete settings.cashierToken;
    }
    return settings;

});


/* ADMIN FUNCTIONS */

/* Uncomment for test
export const saveSettings = regionalFunctions.https.onCall(async (data, context) => {
    try {
        const settingsRef = await admin.firestore().collection(CONSTANTS.COLLECTION_SETTINGS);
        const snapshot = await settingsRef.get();
        if (snapshot.empty) {
            throw new functions.https.HttpsError('not-found', 'Settings not found.');
        }
        const settingsDocRef = snapshot.docs[0].ref;
        const res = await settingsDocRef.update({
            startDate: admin.firestore.Timestamp.fromDate(new Date(data.body.startDate)),
            endDate: admin.firestore.Timestamp.fromDate(new Date(data.body.endDate)),
            startTime: data.body.startTime,
            endTime: data.body.endTime,
            cashierToken: data.body.cashierToken,
        });
        functions.logger.info('Settings updated', res);
        return await getOxHuntSettings();
    } catch (error) {
        functions.logger.error(error);
        throw error;
    }
});
*/

export const redeem = regionalFunctions.https.onCall(async (data, context) => {
    if (data.keepWarm) {
        return {};
    }
    // Restrict access to admin
    if (!(await checkAdminAuth(data.auth))) {
        throw new functions.https.HttpsError('permission-denied', 'User authentication required');
    }

    // Validate input
    if (null == data.body || null == data.body.userToken || 1 > data.body.userToken.length) {
        throw new functions.https.HttpsError('invalid-argument', 'User token is required');
    }

    // Check that game is in progress
    const oxhuntSettings = await getOxHuntSettings();

    if (null == oxhuntSettings.periodStart || null == oxhuntSettings.periodEnd) {
        functions.logger.error('Games are closed (unknown settings)', oxhuntSettings, data.body);
        throw new functions.https.HttpsError('permission-denied', 'Games are closed');
    }

    const periodStartTime = (new Date(oxhuntSettings.periodStart)).getTime();
    const periodEndTime = (new Date(oxhuntSettings.periodEnd)).getTime();
    const currentTime = admin.firestore.Timestamp.now().toDate().getTime();
    if ((currentTime < periodStartTime) || (periodEndTime < currentTime)) {
        functions.logger.error('Games are closed (period)', oxhuntSettings, data.body);
        throw new functions.https.HttpsError('permission-denied', 'Games are closed');
    }
    
    const userId = await checkAuth(data.body.userToken);

    if (oxhuntSettings.cashierToken != data.body.cashierToken) {
        throw new functions.https.HttpsError('permission-denied', 'Cashier authentication required');
    }

    try {
        let redeemedPoints = 0;
        await admin.firestore().runTransaction(async t => {
            const userRef = await admin.firestore().collection(CONSTANTS.COLLECTION_USERS).doc(userId);
            const userDoc = await t.get(userRef);
            if (!userDoc.exists) {
                functions.logger.error('User not found.', oxhuntSettings, userId, data.body);
                throw new functions.https.HttpsError('not-found', 'User not found.');
            }

            const userData = userDoc.data();
            if (null != userData && null != userData.playedGames && 0 < userData.playedGames.length) {
                // Check that game is not played in this period
                userData.playedGames.forEach( (g: any) => {
                    const playedAtTime = g.playedAt.toDate().getTime();
                    if ((periodStartTime <= playedAtTime) && (playedAtTime <= currentTime) && (null == g.redeemedAt)) {
                        redeemedPoints += g.score;
                        g.redeemedAt = admin.firestore.Timestamp.now();
                    }
                });

                await t.update(userRef, { playedGames: userData.playedGames });
            }
        });
        const user = await getOxHuntUser(userId, oxhuntSettings);
        delete user.hash;
        return {
            user: user,
            redeemedPoints: redeemedPoints
        };
    } catch (error) {
        functions.logger.error(error, data);
        throw error;
    }
});

/* Return all users and all games */
export const getUsers = regionalFunctions.https.onCall(async (data, context) => {
    if (data.keepWarm) {
        return {};
    }
    // Restrict access to admin
    if (!(await checkAdminAuth(data.auth))) {
        throw new functions.https.HttpsError('permission-denied', 'User authentication required');
    }

    try {
        // Get users snapshot
        const usersRef = await admin.firestore().collection(CONSTANTS.COLLECTION_USERS).get();

        let users: User[] = [];
        if (!usersRef.empty) {
            users = usersRef.docs.map(user => {
                // create as User class instance and delete hash
                const userObj = new User(user.data());
                delete userObj.hash;
                return userObj;
            });
        }

        return users;
    } catch (error) {
        functions.logger.error(error, data);
        throw error;
    }
});


/* USER REGISTER FUNCTIONS */

/* Check if mail is available */
export const mailAvailable = regionalFunctions.https.onCall(async (data, context) => {

    if (data.keepWarm) {
        return {};
    }
    try {
        // Validate input
        if (!data?.body) {
            throw new functions.https.HttpsError('invalid-argument', 'Register data is required');
        }
        if (!isEmail(data.body.email)) {
            throw new functions.https.HttpsError('invalid-argument', 'Email format is invalid');
        }

        // Check if email is taken
        const userSnapshot = await admin.firestore()
            .collection(CONSTANTS.COLLECTION_USERS)
            .where('email', '==', data.body.email)
            .get();
        if (!userSnapshot.empty) {
            throw new functions.https.HttpsError('invalid-argument', 'Email already taken');
        }
        return {};
    } catch (error) {
        functions.logger.error(error, data);
        throw error;
    }
});

/* Registers a new user and returns an auth token (JWT) */
export const register = regionalFunctions.https.onCall(async (data, context) => {

    if (data.keepWarm) {
        return {};
    }

    try {

        // Validate input
        if (!data?.body) {
            throw new functions.https.HttpsError('invalid-argument', 'Register data is required');
        }
        if (!isEmail(data.body.email)) {
            throw new functions.https.HttpsError('invalid-argument', 'Email format is invalid');
        }
        if (!data.body.fullName || 1 > data.body.fullName.trim().length) {
            throw new functions.https.HttpsError('invalid-argument', 'First name is required');
        }
        if (!data.body.password || data.body.password.length < 6) {
            throw new functions.https.HttpsError('invalid-argument', 'Password format is invalid');
        }

        let authToken = '';
        let user = null;

        functions.logger.info(`Attempting to register user with email ${data.body.email}`);

        await admin.firestore().runTransaction(async t => {

            // Check if email is taken
            const userSnapshot = await admin.firestore()
                .collection(CONSTANTS.COLLECTION_USERS)
                .where('email', '==', data.body.email)
                .get();

            if (!userSnapshot.empty) {
                throw new functions.https.HttpsError('permission-denied', 'Email already taken');
            }
            else {
                // If user doesn't exist, create it
                user = new User();
                user.fullName = data.body.fullName;
                user.email = data.body.email;
                user.createdAt = admin.firestore.Timestamp.now().toDate();
                const bcrypt = await import('bcrypt');
                user.hash = bcrypt.hashSync(data.body.password, 10);
                user.playedGames = [];
                const userRef = await admin.firestore().collection(CONSTANTS.COLLECTION_USERS).add(Object.assign({}, user));
                const jwt = await import('jsonwebtoken');
                authToken = jwt.sign({ userId: userRef.id }, CONSTANTS.SECRET);
                delete user.hash;
            }

        });

        functions.logger.info(`User ${data.body.name} with email ${data.body.email} was registered`);
        return { user: user, authToken: authToken };

    } catch (error) {
        functions.logger.error(error, data);
        throw error;
    }
});

/* Logs in a user with email/password returning the user and an auth token (JWT) */
export const login = regionalFunctions.https.onCall(async (data, context) => {

    if (data.keepWarm) {
        return {};
    }

    try {

        // Validate input
        if (!data?.body) {
            throw new functions.https.HttpsError('invalid-argument', 'Login data is required');
        }
        if (!isEmail(data.body.email)) {
            throw new functions.https.HttpsError('invalid-argument', 'Email format is invalid');
        }
        if (!data.body.password) {
            throw new functions.https.HttpsError('invalid-argument', 'Password format is invalid');
        }


        functions.logger.info(`Attempting to login user with email ${data.body.email}`);

        // Get user snapshot
        const userSnapshot = await admin.firestore()
            .collection(CONSTANTS.COLLECTION_USERS)
            .where('email', '==', data.body.email)
            .get();

        // Ensure user exists for given email
        if (userSnapshot.empty) {
            throw new functions.https.HttpsError('permission-denied', 'Invalid credentials');
        }
        else {
            const user = new User();
            let userId = null;
            userSnapshot.docs.map(doc => {
                Object.assign(user, doc.data());
                userId = doc.id;
            });
            // Check if password match
            const bcrypt = await import('bcrypt');
            if (bcrypt.compareSync(data.body.password, user.hash as string)) {
                // If password match, generate auth token
                const jwt = await import('jsonwebtoken');
                const authToken = jwt.sign({ userId: userId }, CONSTANTS.SECRET);

                functions.logger.info(`User with email ${data.body.email} was logged in`);
                delete user.hash;
                return { user: user, authToken: authToken };
            }
            else {
                throw new functions.https.HttpsError('permission-denied', 'Invalid credentials');
            }
        }

    } catch (error) {
        functions.logger.error(error, data);
        throw error;
    }
});

/* Requests a password reset */
export const requestPasswordReset = regionalFunctions.https.onCall(async (data, context) => {

    if (data.keepWarm) {
        return {};
    }

    try {

        // Validate input
        const email = data.body?.email;
        if (!email || !isEmail(email)) {
            throw new functions.https.HttpsError('invalid-argument', 'A valid email is required');
        }
        else {

            functions.logger.info(`Attempting to generate a password reset link for user with email ${data.body.email}`);

            // Get user snapshot
            const userSnapshot = await admin.firestore()
                .collection(CONSTANTS.COLLECTION_USERS)
                .where('email', '==', data.body.email)
                .get();

            // Ensure user exists for given email
            if (userSnapshot.empty) {
                throw new functions.https.HttpsError('permission-denied', 'No account with that email exists');
            }

            const settings = await getOxHuntSettings();
            // Generate password reset code
            const cryptoJS = await import("crypto-js");
            const plain = `${(new Date()).toISOString()}#${email}`;
            const code = cryptoJS.AES.encrypt(plain, CONSTANTS.SECRET).toString();

            // Send email with password reset link
            try {
                const sendgrid = await import("@sendgrid/mail");
                sendgrid.setApiKey(CONSTANTS.SENDGRID_API_KEY);
                const testMode = null == settings.emailFrom || 'dev@onirix.com' === settings.emailFrom;
                const mail = {
                    to: testMode ? 'dev@onirix.com' : email,
                    from: testMode ? 'dev@onirix.com' : settings.emailFrom,
                    subject: `OxHunt - Password reset request`,
                    html: getPasswordResetRequestEmailHtml(encodeURIComponent(code), settings.appHost)
                };
                await sendgrid.send(mail);
                functions.logger.info(`Password reset link was sent to ${data.body.email}`);
            } catch (error) {
                functions.logger.error(`Error sending reset link`, error);
            }
            return {};
        }
    } catch (error) {
        functions.logger.error(error, data);
        throw error;
    }
});

/* Reset user's password */
export const resetPassword = regionalFunctions.https.onCall(async (data, context) => {

    if (data.keepWarm) {
        return {};
    }

    try {

        // Validate input
        const code = data.body?.code;
        if (!code) {
            throw new functions.https.HttpsError('invalid-argument', 'Code is required');
        }

        functions.logger.info(`Attempting to reset password with code ${data.body.code}`);

        // Decrypt password reset code
        let chunks = null;
        try {
            const cryptoJS = await import("crypto-js");
            const decrypted = cryptoJS.AES.decrypt(code, CONSTANTS.SECRET).toString(cryptoJS.enc.Utf8);
            chunks = decrypted.split("#");
            if (chunks.length !== 2) {
                functions.logger.error(`Unexpected chunks`, chunks);
                throw new functions.https.HttpsError('invalid-argument', 'Code is malformed');
            }
        } catch (error) {
            functions.logger.error(`Error decrypting code`, error);
            throw new functions.https.HttpsError('invalid-argument', 'Code is malformed');
        }

        // Check code has not expired
        const requestDate = new Date(chunks[0]).getTime();
        const email = chunks[1];
        const tenMinutes = 1000 * 60 * 10;
        if (requestDate + tenMinutes < (new Date().getTime())) {
            throw new functions.https.HttpsError('permission-denied', 'Password request link expired');
        }

        // Get user snapshot
        const userSnapshot = await admin.firestore()
            .collection(CONSTANTS.COLLECTION_USERS)
            .where('email', '==', email)
            .get();

        // Ensure user exists for given email
        if (userSnapshot.empty) {
            throw new functions.https.HttpsError('permission-denied', 'User with provided email does not exist');
        }

        // Generate a new random password
        const crypto = await import("crypto");
        const newPassword = crypto.randomBytes(8).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/\=/g, '');
        const bcrypt = await import("bcrypt");
        const newHash = bcrypt.hashSync(newPassword, 10);

        // Update password hash
        await userSnapshot.docs[0].ref.update({ hash: newHash });

        // Send email to notify user
        try {
            const settings = await getOxHuntSettings();
            const testMode = null == settings.emailFrom || 'dev@onirix.com' === settings.emailFrom;
            const sendgrid = await import("@sendgrid/mail");
            sendgrid.setApiKey(CONSTANTS.SENDGRID_API_KEY);
            const mail = {
                to: testMode ? 'dev@onirix.com' : email,
                from: testMode ? 'dev@onirix.com' : settings.emailFrom,
                subject: `${CONSTANTS.APP_NAME} - New password`,
                html: getPasswordResetEmailHtml(newPassword)
            };
            await sendgrid.send(mail);
            functions.logger.info(`A new password was generated and sent to ${email}`);
        } catch (error) {
            functions.logger.error(`Error sending new password`, error);
        }
        return {};
    } catch (error) {
        functions.logger.error(error, data);
        throw error;
    }
});

/* DATA ACCESS FUNCTIONS */
async function getOxHuntSettings(): Promise<Settings> {
    try {
        const settingsRef = await admin.firestore().collection(CONSTANTS.COLLECTION_SETTINGS);
        const snapshot = await settingsRef.get();
        if (snapshot.empty) {
            throw new functions.https.HttpsError('not-found', 'Settings not found.');
        }
        const settingsDoc = snapshot.docs[0];
        const settings = new Settings(settingsDoc?.data());

        const startDate = new Date(settings.startDate);
        const endDate = new Date(settings.endDate);
        const currentDate = admin.firestore.Timestamp.now().toDate();
        if (currentDate.getTime() > endDate.getTime()) {
            settings.status = 'oxhunt-ended';
        } else if (currentDate.getTime() < startDate.getTime()) {
            settings.status = 'oxhunt-not-started';
        } else {
            settings.status = 'oxhunt-ongoing';

            const startTime = settings.startTime?.split(':');
            const startHour = Number(startTime ? startTime[0] : 0); 
            const startMinutes = Number(startTime ? startTime[1] : 1);
            
            const endTime = settings.endTime?.split(':');
            const endHour = Number(endTime ? endTime[0] : 0);
            const endMinutes = Number(endTime ? endTime[1] : 1);

            let periodStart = null;
            let periodEnd = null;
            if (isBeforeTime(currentDate.getUTCHours(), currentDate.getUTCMinutes(), endHour, endMinutes)) {
                periodEnd = new Date(Date.UTC(
                    currentDate.getUTCFullYear(),
                    currentDate.getUTCMonth(),
                    currentDate.getUTCDate(),
                    endHour,
                    endMinutes,
                    0,
                    0
                ));
                periodStart = new Date(Date.UTC(
                    periodEnd.getUTCFullYear(),
                    periodEnd.getUTCMonth(),
                    isBeforeTime(startHour, startMinutes, endHour, endMinutes) ? periodEnd.getUTCDate() : periodEnd.getUTCDate() - 1,
                    startHour,
                    startMinutes,
                    0,
                    0
                ));
            } else {
                periodStart = new Date(Date.UTC(
                    currentDate.getUTCFullYear(),
                    currentDate.getUTCMonth(),
                    currentDate.getUTCDate(),
                    startHour,
                    startMinutes,
                    0,
                    0
                ));
                periodEnd = new Date(Date.UTC(
                    periodStart.getUTCFullYear(),
                    periodStart.getUTCMonth(),
                    !isBeforeTime(startHour, startMinutes, endHour, endMinutes) ? periodStart.getUTCDate() + 1 : periodStart.getUTCDate(),
                    endHour,
                    endMinutes,
                    0,
                    0
                ));
            }

            settings.periodStart = periodStart.toISOString();
            settings.periodEnd = periodEnd.toISOString();
        }
        return settings;
    } catch (error) {
        functions.logger.error(error);
        throw error;
    }
}

async function getOxHuntUser(userId: string, settings?: Settings): Promise<User> {
    try {
        // Get user snapshot
        const userRef = await admin.firestore().collection(CONSTANTS.COLLECTION_USERS).doc(userId);
        const userDoc = await userRef.get();
        if (!userDoc.exists) {
            throw new functions.https.HttpsError('not-found', 'User not found.');
        }
        const user = new User(userDoc.data());
        delete user.hash;

        if (settings && settings.periodStart && settings.periodEnd && user.playedGames && 0 < user.playedGames.length) {
            const periodStartTime = (new Date(settings.periodStart)).getTime();
            const periodEndTime = (new Date(settings.periodEnd)).getTime();
            let currentScore = 0;
            user.playedGames = user.playedGames.filter( (playedGame: PlayedGame) => {
                if (null != playedGame.redeemedAt) {
                    return false;
                }
                if (null != playedGame.playedAt) {
                    const playedAtTime = (new Date(playedGame.playedAt)).getTime();
                    const playedInPeriod = (periodStartTime <= playedAtTime && playedAtTime <=periodEndTime);
                    if (playedInPeriod) {
                        currentScore += playedGame.score;
                        return true;
                    }
                }
                return false;
            });
            user.score = currentScore;
        }
        delete user.hash;
        return user;
    } catch (error) {
        functions.logger.error(error);
        throw error;
    }
}

function isBeforeTime(startHours: number, startMinutes: Number, endHours: Number, endMinutes: Number): boolean {
    if (startHours < endHours) {
        return true;
    } else if (startHours === endHours) {
        return startMinutes <= endMinutes;
    } else {
        return false;
    }
}

/* UTILITY FUNCTIONS */

async function checkAdminAuth(authToken: string): Promise<boolean> {
    const userId = await checkAuth(authToken);
    if (CONSTANTS.ADMIN_ID !== userId) {
        throw new functions.https.HttpsError('permission-denied', 'Invalid admin token');
    }
    return true;
}

async function checkAuth(authToken: string): Promise<string> {
    if (!authToken) {
        throw new functions.https.HttpsError('permission-denied', 'Auth token not found');
    }
    try {
        const jwt = await import("jsonwebtoken");
        const decoded = jwt.verify(authToken, CONSTANTS.SECRET) as any;
        return decoded.userId as string;
    } catch (error) {
        throw new functions.https.HttpsError('permission-denied', 'Invalid token');
    }
}

function isEmail(value: string): boolean {
    return null !== value.match(EMAIL_REG_EXP);
}

function getPasswordResetRequestEmailHtml(code: string, host: string) {
    return `<p>We have received a password reset request from your account. Click on the following link to generate a new password:</p>
            <p><a href="${host}/password-reset?code=${code}">${host}/password-reset?code=${code}</a></p>`;
}

function getPasswordResetEmailHtml(pass: string) {
    return `<p>The new password for your ${CONSTANTS.APP_NAME} account is:</p>
            <h2>${pass}</h2>`;
}

/* DATA MODEL */

class User {
    public fullName?: string;
    public email?: string;
    public hash?: string;
    public playedGames: PlayedGame[];
    public score?: number;
    public createdAt?: Date;

    constructor(data?: admin.firestore.DocumentData | undefined) {
        this.fullName = data?.fullName;
        this.email = data?.email;
        this.hash = data?.hash;
        this.createdAt = data?.createdAt;
        if (data?.playedGames) {
            this.playedGames = data.playedGames.map( (game: any) => new PlayedGame(game));
        } else {
            this.playedGames = [];
        }
    }
}

class PlayedGame {

    public projectOid: string;
    public sceneOid: string;
    public score: number;
    public playedAt: string;
    public redeemedAt?: string;

    constructor(data: any) {
        this.projectOid = data.projectOid;
        this.sceneOid = data.sceneOid;
        this.score = data.score;
        this.playedAt = data?.playedAt?.toDate().toISOString();
        this.redeemedAt = data?.redeemedAt?.toDate().toISOString();
    }
}

class Settings {
    public name: string;
    public onirixHost: string;
    public onirixProjectOid: string;
    public onirixProjectToken: string;
    public startDate: string;
    public endDate: string;
    public startTime: string;
    public endTime: string;
    public status?: string;
    public periodStart?: string;
    public periodEnd?: string;
    public tiers?: Tier[];
    public scenes?: string[];
    public cashierToken?: string;
    public appHost?: string;
    public emailFrom?: string;

    constructor(data: admin.firestore.DocumentData | undefined) {
        this.name = data?.name;
        this.onirixHost = data?.onirixHost;
        this.onirixProjectOid = data?.onirixProjectOid;
        this.onirixProjectToken = data?.onirixProjectToken;
        this.startDate = data?.startDate?.toDate().toISOString();
        this.endDate = data?.endDate?.toDate().toISOString();
        this.startTime = data?.startTime;
        this.endTime = data?.endTime;
        this.scenes = data?.scenes;
        this.cashierToken = data?.cashierToken;
        this.appHost = data?.appHost;
        this.emailFrom = data?.emailFrom;
        if (data?.tiers) {
            this.tiers = data.tiers.map( (tier: any) => new Tier(tier.name, tier.min, tier.max));
            this.tiers?.sort( (a: Tier, b: Tier) => ((b && null != b.min) ? b.min : 0) - ((a && null != a.min) ? a.min : 0) );
        }
    }
}

class Tier {
    public name?: string;
    public min?: number;
    public max?: number;

    constructor(name: string, min: number, max?: number) {
        this.name = name;
        this.min = min;
        this.max = max;
    }
}