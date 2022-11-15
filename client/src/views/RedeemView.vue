<template>
  <main class="oxhunt-redeem">
    <header v-if="!redeemed" class="oxhunt-redeem__header">
      <h1>{{ $t("redeem-title") }}</h1>
      <button class="round" @click="goToHome">
        <img class="logo" src="@/assets/icons/close.svg" />
      </button>
    </header>
    <div v-if="!redeemed" class="oxhunt-redeem__content">
      <h1>{{ $t("redeem-points") }}</h1>
      <p>{{ $t("redeem-p1") }}</p>
    </div>
    <div v-if="!redeemed && tier" class="oxhunt-redeem__tier">
      <div class="oxhunt-tier">
        <span>{{ $t("oxhunt-tier") }} {{ tier.name }}</span>
        <span>{{ tier.min }} {{ tier.max ? "- " + tier.max : "" }} pts</span>
      </div>
      <div class="oxhunt-qr-wrapper">
        <UserScoreView :user="user"></UserScoreView>
        <div class="oxhunt-qr-wrapper__qr">
          <qrcode-vue class="oxhunt-qr" :value="qrUrl" level="L" />
        </div>
      </div>
    </div>
    <div
      v-if="redeemed"
      class="oxhunt-redeem__content oxhunt-redeem__content--success"
    >
      <div>
        <img class="oxhunt-dialog__header-icon" src="@/assets/icons/cup.svg" />
        <h1>{{ $t("redeem-congrats") }}</h1>
        <p>{{ $t("redeem-congrats-p") }}</p>
      </div>
      <div class="oxhunt-redeem__tier oxhunt-redeem__tier--success">
        <div class="oxhunt-tier">
          <span>{{ $t("oxhunt-tier") }} {{ tier.name }}</span>
          <span>{{ $t("redeem-red") }}</span>
        </div>
        <div class="oxhunt-qr-wrapper">
          <UserScoreView :user="user"></UserScoreView>
        </div>
      </div>
    </div>
    <div v-if="redeemed" class="oxhunt-redeem__footer">
      <button @click="goToHome">{{ $t("redeem-back") }}</button>
    </div>
  </main>
  <ErrorDialogView
    v-if="error"
    :error="error"
    @close="$router.push('/')"
  ></ErrorDialogView>
</template>

<script>
import firebaseService from "../services/firebase.service";
import UserScoreView from "./shared/UserScoreView.vue";
import ErrorDialogView from "./shared/ErrorDialogView.vue";
import QrcodeVue from "qrcode.vue";
import authService from "../services/auth.service";

export default {
  name: "RedeemView",
  components: {
    UserScoreView,
    ErrorDialogView,
    QrcodeVue,
  },
  data() {
    return {
      settings: null,
      user: null,
      error: null,
      tier: null,
      qrUrl: null,
      redeemed: false,
      redeemInterval: null,
    };
  },
  beforeMount() {
    this.getSettings();
  },
  methods: {
    async getSettings() {
      try {
        this.settings = await firebaseService.getSettings();
        this.user = await firebaseService.getUser();
        this.getTier();
      } catch (error) {
        console.error(error);
        this.settings = null;
        this.error = {
          title: "error-game",
          message: "error-game-msg",
          closable: false,
        };
      }
    },
    getTier() {
      this.tier = this.settings.tiers.find(
        (tier) =>
          tier.min <= this.user.score &&
          (tier.max ? this.user.score <= tier.max : true)
      );
      if (!this.tier) {
        this.error = {
          title: "error-redeemed",
          message: "error-redeemed-msg",
          closable: false,
        };
      } else {
        this.getRedeemQr();
      }
    },
    getRedeemQr() {
      this.qrUrl = `${
        window.location.origin
      }/redeemUser?userToken=${authService.getAuthToken()}&email=${
        this.user.email
      }&name=${this.user.fullName}`;
      this.redeemInterval = setInterval(() => this.getCheckRedeemed(), 3000);
    },
    async getCheckRedeemed() {
      if (!this.redeemed) {
        this.user = await firebaseService.getUser(true);
        if (!this.user.score || this.user.score === 0) {
          this.redeemed = true;
          clearInterval(this.redeemInterval);
        }
      }
    },
    goToHome() {
      this.$router.push("/home");
    },
  },
};
</script>
<style lang="scss" scoped>
.oxhunt-redeem {
  height: calc(100% - 36px);
  width: calc(100vw - 40px);
  padding: 16px 20px 20px 20px;

  display: flex;
  flex-direction: column;
  justify-content: space-between;

  background-color: var(--color-primary);

  .oxhunt-redeem__header {
    display: flex;
    align-items: center;
    justify-content: space-between;

    h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 500;
      font-family: var(--font-light);
      color: var(--color-font-light);
    }

    button {
      margin-bottom: -30px;
    }
  }

  .oxhunt-redeem__content {
    display: flex;
    flex-direction: column;
    align-items: center;

    h1 {
      font-family: var(--font-medium);
      margin: 0 0 10px 0;
      font-size: 32px;
      font-weight: 800;
      text-align: center;
      color: var(--color-font-light);
    }

    p {
      font-family: var(--font-light);
      margin: 0;
      font-size: 18px;
      text-align: center;
      font-weight: 500;
      color: var(--color-font-light);
    }
  }
}

.oxhunt-redeem__tier {
  width: calc(100% - 40px);
  padding: 14px 20px 20px 20px;
  background-color: #f2f1f3;
  border-radius: 6px;
}

.oxhunt-qr-wrapper {
  background-color: var(--color-background-light);
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-bottom: 20px;

  .oxhunt-qr-wrapper__qr {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .oxhunt-qr {
    height: 57vw !important;
    width: auto !important;
  }
}

.oxhunt-tier {
  display: flex;
  align-items: center;
  justify-content: space-between;

  width: 100%;
  padding-bottom: 14px;
  border-radius: 6px;
  color: var(--color-primary);

  span {
    font-size: 17px;
    font-weight: bold;
  }
}

.oxhunt-redeem__content.oxhunt-redeem__content--success {
  margin-top: 50px;
  height: 100%;
  justify-content: center;

  > div:first-child {
    background-color: var(--color-background-light);
    padding: 20px;
    border-radius: 10px;
    text-align: center;
    margin-bottom: 20px;

    h1 {
      margin: 0 0 10px 0;
      font-family: var(--font-medium);
      font-size: 32px;
      font-weight: 800;
      color: var(--color-font-dark);
    }

    p {
      font-family: var(--font-light);
      font-size: 18px;
      font-weight: 500;
      color: var(--color-font-dark);
      margin-bottom: 0;
    }

    img {
      margin-top: -70px;
      margin-bottom: 14px;
    }
  }

  .oxhunt-redeem__tier--success {
    width: 100%;
    padding: 0;
    background-color: transparent;

    .oxhunt-tier {
      background-color: #0155d2;
      color: var(--color-font-light);
      padding: 14px 20px;
      width: calc(100% - 40px);
      border-radius: 6px 6px 0 0;
    }

    .oxhunt-qr-wrapper {
      border-radius: 0 0 6px 6px;
      padding: 0;
    }
  }
}

.oxhunt-redeem__footer {
  padding-top: 20px;
}
</style>
