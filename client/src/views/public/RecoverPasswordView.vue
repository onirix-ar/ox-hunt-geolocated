<template>
    <div class="layout--users">
        <div>
            <img class="logo" src='@/assets/ox-hunt-logo.svg' />
            
            <div class="step">
                <h1>{{$t("rec-title")}}</h1>
                <p v-if="sent">{{$t("rec-sent")}}</p>
            </div>
        </div>
        <div class="footer">
            <div v-if="error" class="main-error">{{error}}</div>
            <p>
                <router-link to="/login">{{$t("rec-return")}}</router-link>
            </p>
        </div>
    </div>
</template>
<script>
import firebaseService from "../../services/firebase.service";
import { useRoute } from 'vue-router';
import analyticsService from '../../services/analytics.service';

export default {
    name: 'RecoverPasswordView',
    data() {
        return {
            sent: false,
            error: null
        }
    },
    async created() {
        const route = useRoute();
        const code = route.query.code;
        if (code) {
            try {
                await firebaseService.resetPassword(code);
                this.sent = true;
                 analyticsService.sendEvent('password_reset_view_success', { code: code});
            } catch(error) {
                this.error = error.message;
                analyticsService.sendEvent('password_reset_view_error', { code: code, error: error });
            }
            
        } else {
            this.error = this.$t('rec-code');
            analyticsService.sendEvent('password_reset_view_error', { error: this.error });
        }
    }
}
</script>
