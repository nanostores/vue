<template>
  <svg id="logo" xmlns="http://www.w3.org/2000/svg" width="200" height="200">
    <path id="p" d="M107.785 154 48.8 112.698 83.353 99.22l50.559 35.401L107.785 154ZM92.415 46l58.984 41.302-34.553 13.478-50.559-35.4L92.414 46Z"/>
  </svg>
</template>

<style scoped>
#logo {
  #p {
    fill: #000;
  }

  @media (prefers-color-scheme: dark) {
    #p {
      fill: #fff;
    }
  }
}
</style>
