<template>
    <div v-if="user" class="oxhunt-user-score">
        <div class="oxhunt-user-score__left">
            <span class="oxhunt-user-score__name">{{ user.fullName }}</span>
            <span class="oxhunt-user-score__score">{{ user.score ? user.score : 0 }} pts</span>
        </div>
        <span class="oxhunt-user-score__icon"><span>{{ user.fullName.toUpperCase()[0]}}</span></span>
    </div>
</template>
<script>

export default {
    name: "UserScoreView",
    props: {
        user: null
    }
}
</script>
<style scoped lang="scss">
@import url('../../../public/css/vars.css');
.oxhunt-user-score {
    width: calc(100% - 40px);
    padding: 14px 20px;
    border-radius: 6px;

    display: flex;
    align-items: center;
    justify-content: space-between;

    background-color: white;

    .oxhunt-user-score__left {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        color: black;

        span:last-child {
            font-family: var(--font-extrabold);
            font-size: 20px;
            font-weight: 800;
            color: var(--color-primary) !important;
        }

        span:first-child {
            opacity: 0.51;
            font-size: 14px;
            font-weight: bold;
        }
    }

    .oxhunt-user-score__icon {
        position: relative;
        height: 42px;
        width: 42px;
        border-radius: 50%;
        font-family: var(--font-medium);

        background-color: var(--color-secondary);
        background-image: url('@/assets/trama-avatar.svg');

        color: var(--color-font-light);
        text-align: center;
        font-size: 21px;
        font-weight: 900;

        > span {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
        }
    }
}
</style>