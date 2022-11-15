<template>
    <div v-if="errors" class="oxhunt-error-message">
        <p v-for="error of errors" :key="error.$uid">
            {{ error.$message }}
        </p>
    </div>
</template>
<script>

export default {
    name: "ErrorFormItemView",
    props: {
        errors: null
    }
}
</script>
<style scoped lang="scss">
@import url('../../../public/css/vars.css');
.oxhunt-error-message {
    font-size: 10px;
    letter-spacing: normal;
    font-weight: normal;
    color: var(--color-warning);
    text-align: left;
    position: absolute;
    right: 0;
    top: 4px;
}

.oxhunt-error-message p {
    margin-top: 0;
    margin-bottom: 0;
}

.oxhunt-error-message p:nth-child(2) {
    margin-top: -27px;
}
</style>