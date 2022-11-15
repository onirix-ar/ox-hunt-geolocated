<template>
    <div class="oxhunt-dialog">
        <div class="oxhunt-dialog__content">
            <div v-if="!hasCashierToken && !loading && !error" class="oxhunt-dialog__header">
                <h1>{{$t("redeem-title")}}</h1>
                <p>{{$t("rdcash-p")}}</p>
                <p v-if="loading" class="redeemed" v-html="$t('rdcash-redeeming', {name: name, email: email})"></p>
            </div>
            <div v-if="loading" class="oxhunt-dialog__header">
                <h1>{{$t("redeem-title")}}</h1>
                <p class="redeemed" v-html="$t('rdcash-redeeming', {name: name, email: email})"></p>
            </div>
            <div v-if="redeemed && !error" class="oxhunt-dialog__header">
                <img class="oxhunt-dialog__header-icon" src="@/assets/icons/success.svg" />
                <h1>{{redeemedPoints}} {{$t("rdcash-points")}}</h1>
                <p class="redeemed" v-html="$t('rdcash-redeemed', {name: name, email: email})"></p>
            </div>
            <div v-if="error" class="oxhunt-dialog__header">
                <img class="oxhunt-dialog__header-icon" src="@/assets/icons/error.svg" />
                <p>{{error.message}}</p>
                <button @click="$router.go()">{{$t("rdcash-return")}}</button>
            </div>
            <div class="oxhunt-dialog__body">
                <div v-if="!hasCashierToken && !error" class="oxhunt-form">
                    <div class="oxhunt-form__item" :class="{'form__item--error': 0 < v$.cashierToken.$errors?.length}">
                        <label>{{$t("rdcash-token")}}</label>
                        <input type="text" :placeholder="$t('rdcash-token-p')" v-model="cashierToken" />
                        <ErrorFormItemView :errors="v$.cashierToken.$errors"></ErrorFormItemView>
                    </div>
                </div>
            </div>
            <div class="oxhunt-dialog__footer">
                <button v-if="!redeemed && !error" @click="submitHandler" :class="{'loading': loading}">
                    <span class="icon"></span>{{$t("redeem-title")}}
                </button>
            </div>
        </div>
    </div>
</template>
<script>
import firebaseService from "../../services/firebase.service";
import useVuelidate from '@vuelidate/core';
import { required } from '@vuelidate/validators';
import authService from '../../services/auth.service';
import ErrorFormItemView from '../shared/ErrorFormItemView.vue';

export default {
    name: 'RedeemUserView',
    props: {
        visible: null
    },
    components: {
        ErrorFormItemView
    },
    setup() {
        return { v$: useVuelidate() }
    },
    data() {
        return {
            name: null,
            email: false,
            userToken: null,
            loading: false,
            error: false,
            redeemed: false,
            cashierToken: authService.getCashierToken(),
            hasCashierToken: false,
            redeemedPoints: undefined
        }
    },
    validations() {
        return {
            cashierToken: { required }
        }
    },
    created() {
        this.email = this.$route.query.email;
        this.userToken = this.$route.query.userToken;
        this.name = this.$route.query.name;

        if (!this.email || !this.userToken || !this.name) {
            this.$router.push('/login');
        } 
        
        if (this.cashierToken) {
            this.hasCashierToken = true;
            this.redeemUser();
        }
    },
    methods: {
        async redeemUser() {
            if (this.userToken && this.cashierToken) {
                this.loading = true;
                try {
                    const res = await firebaseService.redeem(this.userToken);
                    this.redeemedPoints = res.redeemedPoints;
                    this.loading = false;
                    this.redeemed = true;
                } catch (error) {
                    if (error.code === 'functions/permission-denied') {
                        this.cashierToken = null;
                        authService.clearCashierToken();
                        this.hasCashierToken = false;
                    }

                    this.error = error;
                    this.loading = false;
                    this.redeemed = false;
                }
            } else {
                this.error = true;
            }
        },
        async submitHandler() {
            const isFormCorrect = await this.v$.$validate();
            if (!isFormCorrect) {
                return;
            }
            this.error = null;
            authService.setCashierToken(this.cashierToken);
            this.hasCashierToken = true;
            this.redeemUser();
        },
        closeDialog() {
            this.$emit('close', null);
        }
    }
}
</script>
<style scoped lang="scss">
.oxhunt-dialog {
    background-color: var(--color-primary);

    .oxhunt-dialog__header {
        .redeemed {
            font-family: var(--font-default);
            .email {
                font-family: var(--font-light);
            }
        }
    }
}

.oxhunt-form {
    width: 100%;
}
</style>