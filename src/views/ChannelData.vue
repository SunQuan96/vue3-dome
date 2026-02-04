<template>
  <div class="channel-data-page">
    <van-nav-bar title="渠道数据" left-arrow @click-left="goBack" fixed />
    <div class="page-content">
      <channel-data />
    </div>
  </div>
</template>

<script>
import ChannelData from '@/components/channelData.vue'

export default {
  name: 'ChannelDataPage',
  components: {
    ChannelData
  },
  methods: {
    goBack() {
      this.$router.back()
    }
  }
}
</script>

<style lang="scss" scoped>
.channel-data-page {
  padding-top: 46px;
  min-height: 100vh;
  background-color: #f7f8fa;
}

.page-content {
  width: 100%;
}
</style>
