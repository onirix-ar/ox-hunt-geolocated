<template>
  <main class="oxhunt-init">
    <div class="oxhunt-init__content">
      <div class="oxhunt-init__img">
        <img alt="OxHunt rules" src="@/assets/join-hero@3x.jpg" />
      </div>
      <h2>{{$t("init-title")}}</h2>
      <ol>
        <li>{{$t("init-li1")}}</li>
        <li>{{$t("init-li2")}}</li>
        <li>{{$t("init-li3")}}</li>
      </ol>
      <h2>{{$t("init-prizes")}}</h2>
      <div class="oxhunt-prizes">

        <h1>{{$t("oxhunt-tier")}} {{tier1}}</h1>
        <div class="oxhunt-prize">
          <div class="oxhunt-prize__image">
            <img src="@/assets/prizes/prize-img.svg" />
          </div>
          <div class="oxhunt-prize__content">
            <p class="oxhunt-prize__title">{{$t("init-tickets")}}</p>
          </div>
        </div>
                
        <h1>{{$t("oxhunt-tier")}} {{tier2}}</h1>
        <div class="oxhunt-prize">
          <div class="oxhunt-prize__image">
            <img src="@/assets/prizes/prize-img.svg" />
          </div>
          <div class="oxhunt-prize__content">
            <p class="oxhunt-prize__title">{{$t("init-ferris")}}</p>
          </div>
        </div>
        
        <h1>{{$t("oxhunt-tier")}} {{tier3}}</h1>
        <div class="oxhunt-prize">
          <div class="oxhunt-prize__image">
            <img src="@/assets/prizes/prize-img.svg" />
          </div>
          <div class="oxhunt-prize__content">
            <p class="oxhunt-prize__title">{{$t("init-essent")}}</p>
          </div>
        </div>
        
        <h1>{{$t("init-redemp")}}</h1>
        <p>{{$t("init-luck")}}</p>
      </div>
    </div>
    <footer class="oxhunt-init__footer">
      <button @click="goToRegister">{{$t("oxhunt-get-started")}}</button>
    </footer>
  </main>
  <RulesView :window="true" :open="rules" @close="rules = false"></RulesView>
</template>

<script>
import firebaseService from "../services/firebase.service";
import RulesView from './RulesView.vue';

export default {
  name: "InitView",
  components: {
    RulesView
  },
  props: {
    window: Boolean,
    open: Boolean,
  },
  data() {
    return {
      tier1: null,
      tier2: null,
      tier3: null,
      rules: false
    }
  },
  beforeMount() {
    firebaseService
        .getSettings(false)
        .then((response) => {
          this.tier1 = response.tiers[0].name;
          this.tier2 = response.tiers[1].name;
          this.tier3 = response.tiers[2].name;
        });
  },
  methods: {
    goToRegister() {
      this.$router.push("/login");
    },
    openRules() {
      this.rules = true;
    }
  },
};
</script>
<style lang="scss" scoped>
@import "../../public/css/prizes.scss";
.oxhunt-init {
  height: 100%;
  .oxhunt-init__content {
    height: calc(100% - 140px);
    overflow-y: auto;
    padding: 20px 20px 30px 20px;
    .oxhunt-init__img {
      border-radius: 8px;
      img {
        width: 100%;
        border-radius: 8px;
      }
    }
    h2 {
      margin: 20px 0px 16px 0px;
      font-size: 24px;
      font-weight: 800;
      color: black;
    }
    ol {
      font-size: 18px;
      font-weight: 500;
      color: black;
      margin-top: 16px;
      padding-bottom: 30px;
      padding-left: 34px;
      border-bottom: 1px solid #c5c9cd;
      margin-bottom: 30px;
      li:not(:last-child) {
        margin-bottom: 20px;
      }
    }
  }
  .oxhunt-init__footer {
    height: 50px;
    padding: 20px;
    background-color: #580088;
  }
}

.oxhunt-prizes {
  h1 {
    font-size: 22px;
    font-weight: bold;
    color: black;
  }
  .oxhunt-prize .oxhunt-prize__content .oxhunt-prize__title {
    margin-top: 0px;
  }
}

</style>