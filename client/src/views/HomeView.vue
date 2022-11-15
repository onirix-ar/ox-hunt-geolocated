<template>
  <main class="oxhunt-home">
    <header class="oxhunt-home__header">
      <button class="round__header" @click="openRules">
        <img class="logo" src="@/assets/icons/book.svg" />
      </button>
      <img alt="OxHunt logo" src="@/assets/logo.svg" />
      <button class="round__header" @click="openPrizes">
        <img class="logo" src="@/assets/icons/prizes.svg" />
      </button>
      <LanguageSelectorView></LanguageSelectorView>
    </header>
    <div v-if="!isLoading && user && active" class="oxhunt-home__content">
      <img alt="OxHunt logo" src="@/assets/ox-hunt-logo.svg" />
      <div class="oxhunt-info">{{$t("home-info1")}}</div>
      <ul class="oxhunt-tierlist">
        <li class="oxhunt-tierlist__tier" v-for="(tier, index) in settings.tiers" :key="index"
          :class="{'oxhunt-tierlist__tier--active': isActiveTier(tier) }">
          <div class="oxhunt-tierlist__tier-header">
            <span>{{$t("oxhunt-tier")}} {{tier.name}}</span>
            <span>{{tier.min}} {{tier.max ? '- ' + tier.max : ''}} pts</span>
          </div>
          <div v-if="isActiveTier(tier)">
            <UserScoreView :user="user"></UserScoreView>
            <button class="redeem" @click="openRedeem">
              {{$t("home-redeem")}}
            </button>
          </div>
        </li>
        <li v-if="isUnderTiers()">
          <UserScoreView :user="user"></UserScoreView>
        </li>
      </ul>
    </div>
    <div v-if="!active" class="oxhunt-home__content oxhunt-home__content--inactive">
      <img src="@/assets/icons/calendar-error.svg" />
      <h1>{{$t("home-inactive")}}</h1>
      <p>{{$t("home-inactive-p")}}</p>
      <p class="date" v-html="activeDate"></p>
    </div>
    <footer class="oxhunt-home__footer">
      <button v-if="active" @click="startGame" :class="{'loading': !hasGeo}">
        <span class="icon"></span>
        {{ user && user.playedGames && user.playedGames.length > 0 ? $t("home-keep-play") : $t("home-play") }}
      </button>
    </footer>
  </main>
  <ErrorDialogView v-if="error" :error="error" @close="$router.go()"></ErrorDialogView>
  <RulesView :window="true" :open="rules" @close="rules = false"></RulesView>
  <PrizesView :open="prizes" @close="prizes = false"></PrizesView>
</template>

<script>
import Constants from "../constants";
import firebaseService from "../services/firebase.service";
import oxhuntFunctions from "../services/functions.service";
import UserScoreView from './shared/UserScoreView.vue';
import ErrorDialogView from './shared/ErrorDialogView.vue';
import RulesView from './RulesView.vue';
import PrizesView from './PrizesView.vue';
import LanguageSelectorView from './shared/LanguageSelectorView.vue';
export default {
  name: "HomeView",
  components: {
    UserScoreView,
    ErrorDialogView,
    RulesView,
    PrizesView,
    LanguageSelectorView
  },
  data() {
      return {
        env: Constants.ENV,
        settings: null,
        user: null,
        isLoading: true,
        active: true,
        dateString: '',
        error: null,
        rules: false,
        prizes: false,
        hasGeo: false,
        activeDate: ''
      }
  },
  async created() {
    navigator.geolocation.getCurrentPosition(
      () => {
        this.hasGeo = true;
      },
      () => {
        this.error = {
          title: "error-geo",
          message: "error-geo-msg",
          closable: false
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000
      }
    );
  },
  beforeMount() {
    this.getSettings();
    this.getUser();
  },
  methods: {
    getSettings() {
      firebaseService
        .getSettings()
        .then((response) => {
          this.settings = response;
          this.checkActive();
          this.getDateString();
          this.isLoading = false;
      })
      .catch((error) => {
        console.error(error);
        this.settings = null;
        this.error = {
          title: "error-game",
          message: "error-game-msg",
          closable: false
        }
      });
    },
    async getUser() {
      try {
        this.user = await firebaseService.getUser(true);
      } catch (error) {
        console.error(error);
        this.error = {
          title: "error-user",
          message: "error-user-msg",
          closable: false
        }
      }
    },
    isActiveTier(tier) {
      return tier.min <= this.user.score && (tier.max ? this.user.score <= tier.max : true);
    },
    isUnderTiers() {
      return !this.user.score || this.user.score < this.settings.tiers[this.settings.tiers.length - 1].min;
    },
    checkActive() {
      console.log(this.settings)
      const currentDate = new Date();
      const start = new Date(this.settings.startDate);
      const customHoursInit = parseInt(this.settings.startTime.substring(0, 2));
      const customMinutesInit = parseInt(this.settings.startTime.substring(3 ,5));
      start.setHours(customHoursInit, customMinutesInit);

      const end = new Date(this.settings.endDate);
      const customHoursEnd = parseInt(this.settings.endTime.substring(0, 2));
      const customMinutesEnd = parseInt(this.settings.endTime.substring(3 ,5));
      end.setHours(customHoursEnd, customMinutesEnd);

      const dayInit = start.getDate();
      const hourInit = start.getHours();
      const minutesInit = start.getMinutes();
      const dayEnd = end.getDate();
      const hourEnd = end.getHours();
      const minutesEnd = end.getMinutes();

      if (this.$i18next.language == 'en') {
        const monthInit = start.toLocaleString('en-US', {
          month: 'long',
        });
        
        const monthEnd = end.toLocaleString('en-US', {
          month: 'long',
        });

        this.activeDate = monthInit + ' ' + dayInit + ' - ' + (monthEnd === monthInit ? '' : monthEnd + ' ')  + dayEnd + '<br/>' + 'From ' + hourInit + 'h ' + minutesInit + 'm to ' + hourEnd + 'h ' + minutesEnd + 'm';
      } else {
        const monthInit = start.toLocaleString('fr', {
          month: 'long',
        });
        
        const monthEnd = end.toLocaleString('fr', {
          month: 'long',
        });
        this.activeDate = 'Du ' + dayInit + (monthInit === monthEnd ? '' : ' ' + monthInit) + ' - ' + dayEnd + (monthEnd === monthInit ? ' ' + monthInit : ' ' + monthEnd) + '<br/>' + 'De ' + hourInit + 'h ' + minutesInit + 'm à ' + hourEnd + 'h ' + minutesEnd + 'm';
      }

      this.active = this.settings.status === 'oxhunt-ongoing' && 
        (start <= currentDate.getTime() && currentDate.getTime() <= end);
    },
    openRules() {
      this.rules = true;
    },
    openPrizes() {
      this.prizes = true;
    },
    openRedeem() {
      this.$router.push('/redeem');
    },
    startGame() {
      this.$router.push('/play');
    },
    getDateString() {
      if (!this.active) {
        this.dateString = oxhuntFunctions.getDateString(this.settings);
      }
    }
  }
};
</script>
<style lang="scss" scoped>
.oxhunt-home {
  height: calc(100% - 40px);
  width: calc(100vw - 40px);
  padding: 20px;

  display: flex;
  flex-direction: column;
  justify-content: space-between;

  background-color: var(--color-primary);
  background-repeat: no-repeat;
  background-position: bottom;
  background-size: contain;

  .oxhunt-info {
    font-size: 20px;
    font-weight: 500;
    text-align: center;
    color: var(--color-font-light);
    font-family: var(--font-medium);
    margin: -6px 0px 20px 0px;
  }

  .oxhunt-home__header {
    display: flex;
    align-items: baseline;
    
    > img {
      width: 40%;
      max-width: 111px;
      margin-right: auto;
      margin-left: auto;
    }

    button {
      margin-right: 10px;
    }
  }

  .oxhunt-home__content {
    display: flex;
    flex-direction: column;
    align-items: center;

    img {
      margin-bottom: 20px;
    }

    h1 {
      font-family: var(--font-light);
      margin: 0 0 20px 0;
      font-size: 20px;
      font-weight: 500;
      text-align: center;
      color: var(--color-font-light);
    }

    &.oxhunt-home__content--inactive {
      width: calc(100% - 40px);
      color: var(--color-font-dark);
      background-color: var(--color-background-light);
      padding: 20px;
      border-radius: 10px;
      margin-bottom: 43px;
      text-align: center;

      img {
        margin-top: -70px;
        margin-bottom: 14px;
      }

      h1 {
        margin: 0;
        font-size: 32px;
        font-weight: 800;
        color: var(--color-font-dark);
        font-family: var(--font-medium);
      }

      p {
        font-family: var(--font-light);
        margin: 10px 0 0 0;
        font-size: 18px;
        font-weight: 500;
      }

      .date {
        margin-top: 20px;
        font-family: var(--font-medium);
        font-weight: 800;
      }
    }
  }

  .oxhunt-home__footer {
    margin: -20px;
    padding: 20px;
    min-height: 50px;
  }
}

.oxhunt-tierlist {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;

  li {
    width: 100%;
  }

  .oxhunt-tierlist__tier {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 10px;

    &:last-child {
      margin-bottom: 0;
    }

    .oxhunt-tierlist__tier-header {
      display: flex;
      align-items: center;
      justify-content: space-between;

      width: calc(100% - 40px);
      padding: 14px 20px;
      border-radius: 6px;
      background-color: rgba(255, 255, 255, 0.15) !important;
      color: var(--color-font-light);

      span {
        font-size: 17px;
        font-weight: bold;
      }
    }

    &.oxhunt-tierlist__tier--active {
      align-items: initial;

      .oxhunt-tierlist__tier-header {
        background-color: #ffeeca;
        border-radius: 6px 6px 0 0;
        color: var(--color-primary);
        background: #f2f1f3 !important;
      }

      div:last-child {
        background-color: var(--color-background-light);
        border-radius: 0 0 6px 6px;
        display: flex;
        flex-direction: column;

        button {
          margin: 0 20px 20px 20px;
          width: auto;
        }
      }
    }
  }
}
</style>