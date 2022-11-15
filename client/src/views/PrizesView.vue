<template>
  <main class="oxhunt-rules window" :class="{'open': open}">
    <header class="oxhunt-rules__header">
      <h1>{{$t("prizes-title")}}</h1>
      <button class="round" @click="goToHome">
        <img src="@/assets/icons/close.svg" />
      </button>
    </header>
    <div class="oxhunt-rules__content">
      <h1><span>{{$t("oxhunt-tier")}} {{tier1}}</span><span>{{tier1Points}}pts</span></h1>
        <div class="oxhunt-prize">
          <div class="oxhunt-prize__image">
            <img src="@/assets/prizes/prize-img.svg" />
          </div>
          <div class="oxhunt-prize__content">
            <p class="oxhunt-prize__title">{{$t("init-tickets")}}</p>
          </div>
        </div>
        
        <h1><span>{{$t("oxhunt-tier")}} {{tier2}}</span><span>{{tier2Points}}pts</span></h1>
        <div class="oxhunt-prize">
          <div class="oxhunt-prize__image">
            <img src="@/assets/prizes/prize-img.svg" />
          </div>
          <div class="oxhunt-prize__content">
            <p class="oxhunt-prize__title">{{$t("init-ferris")}}</p>
          </div>
        </div>

        <h1><span>{{$t("oxhunt-tier")}} {{tier3}}</span><span>{{tier3Points}}pts</span></h1>
        <div class="oxhunt-prize">
          <div class="oxhunt-prize__image">
            <img src="@/assets/prizes/prize-img.svg" />
          </div>
          <div class="oxhunt-prize__content">
            <p class="oxhunt-prize__title">{{$t("init-essent")}}</p>
          </div>
        </div>
        
    </div>
  </main>
</template>

<script>
import firebaseService from "../services/firebase.service";

export default {
  name: "RulesView",
  props: {
    open: Boolean
  },
  data() {
    return {
      tier1: null,
      tier2: null,
      tier3: null,
      tier1Points: null,
      tier2Points: null,
      tier3Points: null
    }
  },
  beforeMount() {
    firebaseService
        .getSettings(false)
        .then((response) => {
          this.tier1 = response.tiers[0].name;
          this.tier2 = response.tiers[1].name;
          this.tier3 = response.tiers[2].name;
          this.tier1Points = response.tiers[0].min;
          this.tier2Points = response.tiers[1].min;
          this.tier3Points = response.tiers[2].min;
        });
  },
  methods: {
    goToHome() {
      this.$emit('close');
    }
  }
};
</script>
<style lang="scss" scoped>
@import '../../public/css/prizes.scss';

.oxhunt-rules {
  position: absolute;
  height: calc(100%);
  width: calc(100vw);

  display: flex;
  flex-direction: column;

  background-color: var(--color-background-light);
  transition: all .4s ease-in-out;

  overflow-y: auto;

  &.window {
    top: 150vh;
  }

  &.open {
    z-index: 1;
    top: 0;
  }

  .oxhunt-rules__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px;
    height: 20px;
    background-color: var(--color-primary);
    color: var(--color-font-light);
    margin-bottom: 30px;

    h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 500;
      font-family: var(--font-light);
    }

    button {
      margin-bottom: -35px;
    }
  }

  .oxhunt-rules__content {
    display: flex;
    flex-direction: column;
    color: var(--color-font-dark);
    height: calc(100% - 60px);
    overflow-y: auto;
    padding: 0px 20px 20px 20px;

    h1 {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    h2 {
      font-family: var(--font-medium);
      margin: 0 0 10px 0;
      font-size: 22px;
      font-weight: 800;
    }

    p {
      font-family: var(--font-light);
      font-size: 18px;
      font-weight: 500;
      margin: 0;
    }
  }

  .oxhunt-rules__footer {
    margin: auto -20px -20px -20px;
    padding: 20px;
    background-color: var(--color-font-dark);
  }
}

.oxhunt-rules__content .oxhunt-availability {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  font-size: 16px;
  font-weight: bold;
  color: #fb591f;
  background-color: #ffeeca;
  border-radius: 8px;
  img {
    margin: 0px 10px 0px 0px;
    width: 24px;
    height: 24px;
  }
}

.oxhunt-rules__content > h1 {
  font-size: 24px;
  font-weight: 800;
  color: black;
}

</style>