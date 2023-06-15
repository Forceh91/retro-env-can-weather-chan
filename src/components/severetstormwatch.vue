<template>
  <div id="stw_explanation">
    <span>a severe thunderstorm watch is</span>
    <span>an alert of possible thndrstrms</span>
    <span>large hail, intense lightning,</span>
    <span>locally heavy rain or damaging</span>
    <span>winds in and close to the watch</span>
    <span>area. persons in and near these</span>
    <span>areas should be on the lookout</span>
    <span>for severe weather conditions</span>
  </div>
</template>

<script>
export default {
  name: "severetstormwatch",
};
</script>

<style lang="scss" scoped>
#stw_explanation {
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin: 0 auto;
  text-align: left;
  text-transform: uppercase;
  width: 380px;
}
</style>
