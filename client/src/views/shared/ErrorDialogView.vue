<template>
  <div v-if="error" class="oxhunt-dialog">
    <button v-if="error.closable" class="oxhunt-dialog__close round" @click="goToHome">
      <img class="logo" src="@/assets/icons/close.svg" />
    </button>
    <div class="oxhunt-dialog__content">
      <div class="oxhunt-dialog__header">
        <img class="oxhunt-dialog__header-icon" src="@/assets/icons/error.svg" />
        <h1>{{$t(error.title)}}</h1>
        <p>{{$t(error.message)}}</p>
      </div>
      <div v-if="!error.closable" class="oxhunt-dialog__footer">
        <button @click="goToHome">{{$t("error-gohome")}}</button>
      </div>
    </div>
  </div>
</template>

<script>
import analyticsService from "../../services/analytics.service";
import authService from '../../services/auth.service';

export default {
  name: "ErrorDialogView",
  props: {
    error: {
      default: {
        title: "error-404",
        message: "error-404-msg",
        closable: false
      }
    }
  },
  mounted() {
    analyticsService.sendEvent("error_view", { error: this.error.message });
  },
  methods: {
    goToHome() {
      if (authService.isLoggedIn()) {
        this.$emit('close');
      } else {
        this.$router.push('/login');
      }
    }
  }
};
</script>
<style scoped lang="scss">
@import "../../../public/css/vars.css";
</style>

