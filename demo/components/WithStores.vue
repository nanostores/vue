<template></template>

<script lang="ts" setup>
import { useStore } from '../../use-store';
import { $atom, $map, $deepMap } from '../stores.js'

const atom = useStore($atom)
const map = useStore($map)
const deepMap = useStore($deepMap)
</script>

