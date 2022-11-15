<template>
    <div>
        <button class="oxhunt-language-button" v-on:click="clickMenu()">
            {{selectedLanguage}}
        </button>
        <ul class="oxhunt-language-menu" :class="{'oxhunt-language-menu--show': showMenu}">
            <li v-for="lang in languages" :key="lang.key" v-on:click="changeLanguage(lang)"
                :class="{'oxhunt-language-sel': lang.key === selectedLanguage }">
                {{lang.label}}
                <img class="check" src="@/assets/icons/check.svg"/>
            </li>
        </ul>
    </div>
</template>
<script>
export default {
    name: "LanguageSelectorView",
    data() {
        return {
            languages: [{ key: 'en', label: "English" }, { key: 'fr', label: "Français" }],
            selectedLanguage: this.$i18next.language,
            showMenu: false
        }
    },
    methods: {
        clickMenu() {
            this.showMenu = !this.showMenu;
        },
        async changeLanguage(lang) {
            await this.$i18next.changeLanguage(lang.key);
            this.selectedLanguage = lang.key;
            this.showMenu = false;
        }
    }
}
</script>
<style scoped lang="scss">
@import url('../../../public/css/vars.css');
div {
    align-self: center;
}
.oxhunt-language-button {
    height: 50px;
    width: 50px;
    padding: 12px;
    border-radius: 50%;
    border: solid 1px var(--color-font-light);

    font-family: var(--font-medium);
    font-size: 20px;
    font-weight: 500;
    text-align: center;
    text-transform: uppercase;
    
    color: var(--color-font-light);
    background-color: transparent;

    cursor: pointer;
}

.oxhunt-language-menu {
    position: absolute;
    display: none;
    list-style: none;
    position: absolute;
    right: 20px;
    top: 90px;
    width: 170px;
    border-radius: 6px;
    user-select: none;
    &.oxhunt-language-menu--show {
        display: flex;
        flex-direction: column;
    }

    li {
        font-family: var(--font-medium);
        font-size: 20px;
        font-weight: 800;
        user-select: none;
        cursor: pointer;
        background-color: #fff;

        padding: 20px;
        height: calc(70px - 40px);
        width: calc(170px - 40px);

        display: flex;
        align-items: center;
        justify-content: space-between;

        .check {
            display: none;
            width: 24px;
        }

        &:first-child {
            border-radius: 6px 6px 0 0;
        }

        &:last-child {
            border-radius: 0 0 6px 6px;
        }

        &:hover {
            background-color: var(--color-secondary);
        }

        &.oxhunt-language-sel {
            background-color: var(--color-secondary);
            color: #fff !important;
            .check {
                display: initial;
            }
        }
    }
}
</style>