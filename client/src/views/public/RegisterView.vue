<template>
    <div class="oxhunt-login">
        <div class="oxhunt-login__header">
            <img class="logo" src='@/assets/ox-hunt-logo.svg' />
            
            <div class="oxhunt-login__description">
                <h1>{{$t("register-title")}}</h1>
            </div>
        </div>

        <div class="oxhunt-login__form-wrapper">
            <div class="oxhunt-form" :class="{'loading': loading}">
                <div class="oxhunt-form__item" :class="{'oxhunt-form__item--error': 0 < v$.fullName.$errors?.length}">
                    <label>{{$t("register-username")}}</label>
                    <input type="text" :placeholder="$t('register-username-p')" v-model="v$.fullName.$model" @focus="resetError"/>
                    <ErrorFormItemView :errors="v$.fullName.$errors"></ErrorFormItemView>
                </div>
                <div class="oxhunt-form__item" :class="{'oxhunt-form__item--error': 0 < v$.email.$errors?.length}">
                    <label>{{$t("email")}}</label>
                    <input type="email" :placeholder="$t('register-email-p')" v-model="v$.email.$model" @focus="resetError"/>
                    <ErrorFormItemView :errors="v$.email.$errors"></ErrorFormItemView>
                </div>
                <div class="oxhunt-form__item oxhunt-form__item--password" :class="{'oxhunt-form__item--error': 0 < v$.password.$errors?.length}">
                    <label>{{$t("password")}}</label>
                    <input type="password" :placeholder="$t('register-password-p')"  v-model="v$.password.$model" />
                    <ErrorFormItemView :errors="v$.password.$errors"></ErrorFormItemView>
                </div>

                <div class="oxhunt-form-item">
                    <div class="oxhunt-check" :class="{'oxhunt-check--selected' : v$.privacyPolicy.$model}">
                        <span class="box" @click="v$.privacyPolicy.$model = !v$.privacyPolicy.$model">
                            <input type="checkbox" v-model="v$.privacyPolicy.$model"/>
                        </span>
                        <span class="label">{{$t("register-accept")}} <a :href="legalLink" target="_blank">{{$t("oxhunt-policy")}}</a>.</span>
                    </div>
                </div>
            </div>
            <div class="oxhunt-footer">
                <div v-if="error" class="main-error">{{error}}</div>
                <button :disabled="v$.$invalid || !privacyPolicy" @click="submitUser" :class="{'loading': loading}">
                    <span class="icon"></span>
                    <span>{{$t("register-create")}}</span>
                </button>
                <p class="">{{$t("register-account")}} <router-link to="/login">{{$t("register-login")}}</router-link></p>
            </div>
        </div>
    </div>
</template>
<script>
import firebaseService from "../../services/firebase.service";
import useVuelidate from '@vuelidate/core';
import { required, email, minLength} from '@vuelidate/validators';
import ErrorFormItemView from '../shared/ErrorFormItemView.vue';
import authService from '../../services/auth.service';
import analyticsService from '../../services/analytics.service';
import Constants from "../../constants";

export default {
    name: 'RegisterView',
    components: {
        ErrorFormItemView
    },
    setup() {
        return { v$: useVuelidate() }
    },
    data() {
        return {
            email: null,
            password: null,
            fullName: null,
            privacyPolicy: false,
            error: null,
            loading: false,
            legalLink: Constants.LEGAL_LINK,
        }
    },
    validations() {
        return {
            email: {required, email, $autoDirty: true },
            password: { required, minLength: minLength(6), $autoDirty: true },
            fullName: { required, minLength: minLength(1), $autoDirty: true },
            privacyPolicy: { required, minLength: minLength(1), $autoDirty: true }
        }
    },
    methods: {
        resetError() {
            this.error = null;
        },
        async submitUser() {
            try {
                const isFormCorrect = await this.v$.$validate();
                if (!isFormCorrect) {
                    analyticsService.sendEvent('register_invalid_from', {
                        email: this.email, firstName: this.firstName, lastName: this.lastName,
                        company: this.company, jobTitle: this.jobTitle});
                    return;
                }
                this.error = null;
                this.loading = true;
                const newUser = {
                    fullName: this.fullName,
                    email: this.email,
                    password: this.password
                }
                const registerResponse = await firebaseService.register(newUser);
                if (registerResponse.authToken) {
                    authService.setAuth(registerResponse.authToken);
                    await firebaseService.getUser();
                    analyticsService.sendEvent('register_succeess', newUser);
                    this.$router.push({ name: 'home' });
                }
            } catch (error) {
                this.error = error.message;
                console.error(error);
                analyticsService.sendEvent('register_error', {
                    error: this.error,
                    email: this.email, 
                    fullName: this.fullName
                });
            } finally {
                this.loading = false;
            }
        }
    }
}
</script>
<style lang="scss" scoped>
@import '../../../public/css/login.scss';

.oxhunt-login__description {
    margin: 6px 0px 0px 0px;
}

.oxhunt-form-item.oxhunt-form-item--blue {
  margin: 20px 0;
  padding: 12px;
  border-radius: 8px;
  background-color: #dfefff;
  font-size: 14px;
  text-align: center;
}

</style>
