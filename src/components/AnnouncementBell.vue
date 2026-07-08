<template>
  <el-popover v-model:visible="visible" placement="bottom-end" :width="390" trigger="click" @show="load">
    <template #reference>
      <el-badge :value="unreadCount" :max="99" :hidden="unreadCount===0" class="announcement-badge">
        <el-button circle aria-label="查看平台公告"><el-icon><Bell /></el-icon></el-button>
      </el-badge>
    </template>
    <div class="announcement-popover">
      <div class="popover-header"><b>平台公告</b><span>{{ unreadCount }} 条未读</span></div>
      <div v-loading="loading" class="announcement-list">
        <el-empty v-if="!loading&&!items.length" description="暂无公告" :image-size="64" />
        <button v-for="item in items" :key="item.id" class="announcement-item" :class="{unread:!isRead(item)}" @click="open(item)">
          <span class="item-title"><i v-if="item.pinned">置顶</i>{{ item.title }}</span>
          <small>{{ formatTime(item.publishTime) }}</small>
          <em>{{ item.content }}</em>
        </button>
      </div>
    </div>
  </el-popover>
  <el-dialog v-model="detailVisible" :title="selected?.title||'公告详情'" width="min(620px, 92vw)" append-to-body>
    <div class="detail-time">发布于 {{ formatTime(selected?.publishTime) }}</div>
    <div class="detail-content">{{ selected?.content }}</div>
    <template #footer><el-button type="primary" @click="detailVisible=false">我知道了</el-button></template>
  </el-dialog>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { getMemberAnnouncements, markAnnouncementRead } from '../api/announcement.js'

const visible=ref(false),detailVisible=ref(false),loading=ref(false),items=ref([]),unreadCount=ref(0),selected=ref(null)
const isRead=item=>Number(item.isRead)===1
const formatTime=value=>value?new Date(value).toLocaleString():'-'
async function load(){loading.value=true;try{const data=await getMemberAnnouncements();items.value=data?.records||[];unreadCount.value=Number(data?.unreadCount||0)}finally{loading.value=false}}
async function open(item){selected.value=item;detailVisible.value=true;if(!isRead(item)){item.isRead=1;unreadCount.value=Math.max(0,unreadCount.value-1);try{const data=await markAnnouncementRead(item.id);items.value=data?.records||items.value;unreadCount.value=Number(data?.unreadCount||0)}catch{item.isRead=0;unreadCount.value++}}}
onMounted(load)
</script>

<style scoped>
.announcement-badge{cursor:pointer}.popover-header{display:flex;justify-content:space-between;align-items:center;padding:4px 4px 12px;border-bottom:1px solid #eef0f4}.popover-header span{font-size:12px;color:#909399}.announcement-list{max-height:430px;overflow:auto;min-height:90px}.announcement-item{position:relative;width:100%;border:0;border-bottom:1px solid #f0f2f5;background:#fff;text-align:left;padding:14px 12px;display:grid;gap:6px;cursor:pointer}.announcement-item:hover{background:#f7f8fc}.announcement-item.unread{background:#f4f7ff}.announcement-item.unread:before{content:'';position:absolute;left:2px;top:20px;width:6px;height:6px;border-radius:50%;background:#f56c6c}.item-title{font-weight:600;color:#303133}.item-title i{font-style:normal;font-size:11px;color:#fff;background:#f56c6c;border-radius:3px;padding:2px 4px;margin-right:6px}.announcement-item small{color:#909399}.announcement-item em{font-style:normal;color:#606266;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.detail-time{color:#909399;font-size:13px;margin-bottom:18px}.detail-content{white-space:pre-wrap;line-height:1.8;color:#303133;word-break:break-word}
</style>
