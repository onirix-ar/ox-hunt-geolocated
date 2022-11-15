<template>
    <div>
       <iframe id="visor" 
       ref="onirixIframe"
       style="position:fixed;top:0;left:0;right:0;bottom:0;width:100%;height:100%;z-index:999;display:block;border:none;" 
       src="https://studio.onirix.com/projects/9986960545584d38ba33e14d817b2d28/webar/beta?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEyNjczLCJwcm9qZWN0SWQiOjMyMDQ3LCJyb2xlIjozLCJpYXQiOjE2NjI5ODE1ODd9.eEtm74BzSU57VJ8wt52V2uDnT-Ojp82WhEwtXFV6p4s" 
       allow="camera;gyroscope;accelerometer;magnetometer;fullscreen;xr-spatial-tracking;geolocation;"> 
       </iframe>
    </div>
</template>
<script>
import firebaseService from "../../services/firebase.service";
import oxhuntFunctions from "../../services/functions.service";

export default {
    name: 'GameView',
    data() {
        return {
            iframeUrl: null,
            messageListener: (messageEvent) => this.onMessageReceived(messageEvent)
        }
    },
    beforeMount() {
        this.setIframeUrl();
    },
    async created() {
        window.addEventListener('message', this.messageListener);
    },
    beforeUnmount() {
        window.removeEventListener('message', this.messageListener); 
    },
    methods: {
        async setIframeUrl() {
            const settings = await firebaseService.getSettings();
            const user = await firebaseService.getUser(true);
            let scenesPlayed = '';
            if (user.playedGames && 0 < user.playedGames.length) {
                scenesPlayed = `&oxhuntPlayed=${user.playedGames.map( game => game.sceneOid).join()}`;
            }
            this.iframeUrl = `${settings.onirixHost}/projects/${settings.onirixProjectOid}/webar?token=${settings.onirixProjectToken}${scenesPlayed}&locale=${this.$i18next.language}`;           
        },
        async onMessageReceived(msg) {
            if (msg && msg.data) {
                try {
                    const gameMessage = JSON.parse(msg.data);
                    if ('oxhunt-game-end' === gameMessage.action) {
                        try {
                            const response = await this.saveScore(gameMessage.sceneOid, gameMessage.score);
                            this.sendMessageToStudio(response, 'score-saved');
                        } catch (error) {
                            console.error(`Error on save score`, error.message);
                            let msg = {
                                title: error.message,
                                detail: ''
                            }
                            if (error.message == 'Game already played.') {
                                msg = {
                                    type: 'played',
                                    text: this.$t('game-played'),
                                }
                            } else if (error.message == 'Unknown game') {
                                msg = {
                                    type: 'played',
                                    text: this.$t('game-location'),
                                }
                            } else {
                                const settings = await firebaseService.getSettings();
                                msg = {
                                    type: 'closed',
                                    title: this.$t('game-closed-title'),
                                    text: this.$t('game-closed-text'),
                                    detail: oxhuntFunctions.getDateString(settings),
                                }
                            }
                            this.sendMessageToStudio(msg, 'error');    
                        }
                    } else if ('oxhunt-go-home' === gameMessage.action) {
                        this.$router.push('/');
                    }
                } catch (error) {
                    console.debug(`Unknown message`, msg.data, error);
                }
            }
        },
        async saveScore(sceneOid, score) {
            const response = await firebaseService.saveScore(sceneOid, score);
            return response;
        },
        sendMessageToStudio(msg, action) {
            msg['origin']= 'OxHuntMusic';
            msg['action']= action;
            this.$refs.onirixIframe.contentWindow.postMessage(JSON.stringify(msg), '*');
        }
    }
}
</script>
<style scoped lang="scss">

</style>