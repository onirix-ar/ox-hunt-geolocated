<template>
    <div class="oxhunt-login">
        <div class="oxhunt-login__header">
            <img class="logo" src='@/assets/ox-hunt-logo.svg' />
            
            <div class="oxhunt-login__description">
                <h1>{{$t("login-title")}}</h1>
            </div>
        </div>
            
        <div class="oxhunt-login__form-wrapper">
            <div class="oxhunt-form" :class="{'loading': loading}">
                <div class="oxhunt-form__item" :class="{'oxhunt-form__item--error': 0 < v$.email.$errors?.length}">
                    <label>{{$t("email")}}</label>
                    <input type="email" :placeholder="$t('email-placeholder')" v-model="v$.email.$model" />
                    <ErrorFormItemView :errors="v$.email.$errors"></ErrorFormItemView>
                </div>
                <div class="oxhunt-form__item oxhunt-form__item--password" :class="{'oxhunt-form__item--error': 0 < v$.password.$errors?.length}">
                    <label>{{$t("password")}}</label>
                    <input type="password" :placeholder="$t('password-placeholder')" v-model="v$.password.$model" />
                    <ErrorFormItemView :errors="v$.password.$errors"></ErrorFormItemView>
                </div>
            </div>
            
            <div class="oxhunt-footer">
                <div v-if="error" class="main-error">{{error}}</div>
                <button @click="submitLogin" :class="{'loading': loading}" :disabled="v$.$invalid">
                    <span class="icon"></span>
                    <span>{{$t("login-login")}}</span>
                </button>
                <p class="">
                    <a href="#" @click="toggleForgotDialog">{{$t("login-forgot")}}</a>
                </p>
                <p>
                    {{$t("login-no-account")}} <router-link to="/register">{{$t("login-signup")}}</router-link>
                </p>
            </div>
        </div>
    </div>
    <ForgotPasswordView v-if="visible" @close="toggleForgotDialog" ></ForgotPasswordView>
</template>
<script>
import firebaseService from "../../services/firebase.service";
import authService from "../../services/auth.service";
import useVuelidate from '@vuelidate/core';
import { required, email, minLength } from '@vuelidate/validators';
import ErrorFormItemView from '../shared/ErrorFormItemView.vue';
import analyticsService from '../../services/analytics.service';
import ForgotPasswordView from './ForgotPasswordView.vue';

export default {
    name: 'LoginView',
    components: {
        ErrorFormItemView,
        ForgotPasswordView
    },
    setup() {
        return { v$: useVuelidate() }
    },
    data() {
        return {
            showPassword: false,
            email: null,
            password: null,
            error: null,
            loading: false,
            visible: false
        }
    },
    validations() {
        return {
            email: { required, email, $autoDirty: true },
            password: { required, minLength: minLength(6), $autoDirty: true },
        }
    },
    methods: {
        toggleForgotDialog() {
            this.visible = !this.visible;
        },
        async submitLogin() {
            try {
                const isFormCorrect = await this.v$.$validate();
                if (!isFormCorrect) {
                    analyticsService.sendEvent('login_view_invalid_form', {email: this.email, password: this.password});
                    return;
                }
                this.error = null;
                this.loading = true;
                const loginResponse = await firebaseService.login(this.email, this.password);
                if (loginResponse.authToken) {
                    authService.setAuth(loginResponse.authToken);
                    await firebaseService.getUser();
                    analyticsService.sendEvent('login_view_success', {email: this.email});
                    this.$router.push({ name: 'home' });
                }
                this.loading = false;
            } catch (error) {
                this.error = error.message;
                this.loading = false;
                console.error(error);
                analyticsService.sendEvent('login_view_error', {email: this.email, error: this.error });
            }
        }
    }
}
</script>
<style scoped lang="scss">
@import '../../../public/css/login.scss';
</style>