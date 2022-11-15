<template>
  <div class="oxhunt-settings">
    <h1>OxHunt settings</h1>
    <form v-if="settings" class="oxhunt-settings__form" @submit.prevent="submitSettings">
      <div class="oxhunt-form-field">
        <label>Onirix Host</label>
        <input type="text" v-model="settings.onirixHost" />
      </div>
      <div class="oxhunt-form-field">
        <label>Onirix Project OID</label>
        <input type="text" v-model="settings.onirixProjectOid" />
      </div>
      <div class="oxhunt-form-field">
        <label>Onirix Project Token</label>
        <input type="text" v-model="settings.onirixProjectToken" />
      </div>
      <div class="oxhunt-form-field">
        <label>Start date</label>
        <input type="date" v-model="settings.startDate" />
      </div>
      <div class="oxhunt-form-field">
        <label>End date</label>
        <input type="date" v-model="settings.endDate" />
      </div>
      <div class="oxhunt-form-field">
        <label>Start time</label>
        <input type="time" v-model="settings.startTime" />
      </div>
      <div class="oxhunt-form-field">
        <label>End time</label>
        <input type="time" v-model="settings.endTime" />
      </div>
      <h2>Tiers</h2>
      <div class="oxhunt-form-field oxhunt-form-field__tiers" v-for="(tier, index) in settings.tiers" :key="index">
        <input type="text" v-model="tier.name" />
        <input type="number" v-model="tier.min" />
        <input type="number" v-model="tier.max" />
      </div>
      <button :disabled="isLoading" type="submit">Save settings</button>
    </form>
  </div>
</template>
<script>
import firebaseService from "../../services/firebase.service";

export default {
  name: "SettingsView",
  created() {
    firebaseService
      .getSettings()
      .then((response) => {
        this.settings = response;
        this.settings.startDate = this.settings.startDate.split('T')[0];
        this.settings.endDate = this.settings.endDate.split('T')[0];
        this.isLoading = false;
      })
      .catch((error) => {
        console.error(error);
        this.settings = null;
      });
  },
  data() {
    return {
      settings: null,
      isLoading: true
    };
  },
  methods: {
    async submitSettings() {
      if (!this.isLoading) {
        this.isLoading = true;
        firebaseService.saveSettings(this.settings).then(response  => {
          this.settings = response;
          this.settings.startDate = this.settings.startDate.split('T')[0];
          this.settings.endDate = this.settings.endDate.split('T')[0];
          this.isLoading = false;
        }).catch(error => {
          console.error(error);
        });
      }
    }
  }
};
</script>
<style scoped lang="scss">
@import '../../../public/css/vars.css';

.oxhunt-settings {
  padding: 1em;
  display: flex;
  flex-direction: column;
  align-items: center;

  h1 {
    margin: 0 0 1em 0;
  }

  .oxhunt-settings__form {
    .oxhunt-form-field {
      width: 100%;
      display: flex;
      align-items: center;
      margin-bottom: 10px;

      label {
        text-align: right;
        margin-right: 10px;
        width: 40%;
        font-size: 16px;
      }

      input {
        height: 40px;
        font-size: 16px;
        padding: 10px;
        width: 100%;
      }
    }

    h2 {

    }

    .oxhunt-form-field__tiers {
      display: flex;
      align-items: center;
      justify-content: space-evenly;
      margin-bottom: 10px;

      input {
        width: calc(33% - 10px);
        &:not(:last-child) {
          margin-right: 10px;
        }
      }
    }
  }
}
</style>