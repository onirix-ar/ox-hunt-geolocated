<template>
    <div class="oxhunt-dialog">
        <button class="oxhunt-dialog__close round" @click="closeDialog">
            <img class="logo" src="@/assets/icons/close.svg" />
        </button>
        <div class="oxhunt-dialog__content">
            <div v-if="!sent" class="oxhunt-dialog__header">
                <h1>{{$t("forgot-title")}}</h1>
                <p>{{$t("forgot-sub")}}</p>
            </div>
            <div v-if="sent" class="oxhunt-dialog__header">
                <img class="oxhunt-dialog__header-icon" src="@/assets/icons/success.svg" />
                <p>{{$t("forgot-sent")}}</p>
            </div>
            <div class="oxhunt-dialog__body">
                <div v-if="!sent" class="oxhunt-form">
                    <div class="oxhunt-form__item" :class="{'form__item--error': 0 < emailForm$.email.$errors?.length}">
                        <label>{{$t("email")}}</label>
                        <input type="email" :placeholder="$t('email-placeholder')" v-model="emailForm$.email.$model" />
                        <ErrorFormItemView :errors="emailForm$.email.$errors"></ErrorFormItemView>
                    </div>
                </div>
            </div>
            <div class="oxhunt-dialog__footer">
                <button v-if="!sent" @click="submitHandler" :class="{'loading': sending}" :disabled="emailForm$.$invalid">
                    <span class="icon"></span> {{$t("forgot-reset")}}
                </button>
                <button v-if="sent" @click="closeDialog">{{$t("forgot-okay")}}</button>
            </div>
        </div>
    </div>
</template>
<script>
import firebaseService from "../../services/firebase.service";
import useVuelidate from '@vuelidate/core';
import { required, email } from '@vuelidate/validators';
import ErrorFormItemView from '../shared/ErrorFormItemView.vue';
import analyticsService from '../../services/analytics.service';

export default {
    name: 'ForgotPasswordView',
    components: {
        ErrorFormItemView
    },
    setup() {
        return { emailForm$: useVuelidate({ $scope: false }) }
    },
    data() {
        return {
            email: null,
            sent: false,
            error: null,
            sending: false
        }
    },
    validations() {
        return {
            email: { required, email }
        }
    },
    methods: {
        async submitHandler() {
            try {
                this.sending = true;
                const isFormCorrect = await this.emailForm$.$validate();
                if (!isFormCorrect) {
                    return;
                }
                this.error = null;
                await firebaseService.requestPasswordReset(this.email);
                this.sent = true;
                analyticsService.sendEvent('request_password_view', {email: this.email});
                this.sending = false;
            } catch (error) {
                this.error = error.message;
                console.error(error);
                analyticsService.sendEvent('request_password_view_error', {email: this.email, error: this.error});
                this.sending = false;
            }
        },
        closeDialog() {
            this.$emit('close', null);
        }
    }
}
</script>
<style scoped lang="scss">
.oxhunt-form {
    width: 100%;
}

.oxhunt-dialog__header p {
    font-family: var(--font-default);
}

</style>