<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
const authStore = useAuthStore()
const router = useRouter()
const initials = () => authStore.user?.email?.slice(0, 2).toUpperCase() ?? 'GJ'
const logout = () => {
  authStore.logout()
  router.push('/login')
}
</script>

<template>
  <div class="app-layout">

    <!-- SIDEBAR -->
    <aside class="sidebar">
      <div class="sidebar-top">
        <div class="sidebar-logo">
          <span class="sidebar-logo-icon">GJ</span>
          <span class="sidebar-logo-name">Gestão Jeans</span>
        </div>

        <nav class="sidebar-nav">
          <router-link to="/dashboard" class="sidebar-link">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>
            <span>Dashboard</span>
          </router-link>
          <router-link to="/financeiro" class="sidebar-link">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            <span>Financeiro</span>
          </router-link>
          <router-link to="/vendas" class="sidebar-link">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
            <span>Produção</span>
          </router-link>
          <router-link to="/estoques" class="sidebar-link">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
            <span>Estoque</span>
          </router-link>
          <router-link to="/pessoas" class="sidebar-link">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            <span>Pessoas</span>
          </router-link>
          <router-link to="/agenda" class="sidebar-link">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            <span>Agenda</span>
          </router-link>
        </nav>
      </div>

      <div class="sidebar-bottom">
        <div class="sidebar-user">
          <div class="sidebar-avatar">{{ initials() }}</div>
          <div class="sidebar-user-info">
            <span class="sidebar-user-name">{{ authStore.user?.email?.split('@')[0] ?? 'Usuário' }}</span>
            <span class="sidebar-user-email">{{ authStore.user?.email ?? '' }}</span>
          </div>
        </div>
        <button class="sidebar-logout" title="Sair" @click="logout">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          <span>Sair</span>
        </button>
      </div>
    </aside>

    <!-- RIGHT WRAP -->
    <div class="content-wrap">

      <!-- TOP NAV -->
      <nav class="top-nav">
        <div class="tn-right">
          <button class="tn-icon-btn" title="Buscar">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          </button>
          <button class="tn-icon-btn" title="Notificações">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
          </button>
        </div>
      </nav>

      <!-- PAGE AREA -->
      <div class="page-area">
        <router-view />
      </div>

    </div>
  </div>
</template>

<style scoped>
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

.app-layout {
  display: flex;
  height: 100vh;
  overflow: hidden;
  font-family: var(--font-sans);
  background: var(--color-page);
}

/* SIDEBAR */
.sidebar {
  width: 208px;
  background: var(--green-900);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  flex-shrink: 0;
  padding: 18px 14px;
}

.sidebar-logo {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 0 8px;
  margin-bottom: 22px;
}

.sidebar-logo-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px; height: 28px;
  border-radius: 8px;
  background: var(--green-500);
  color: #fff;
  font-size: 0.68rem;
  font-weight: 800;
  flex-shrink: 0;
}

.sidebar-logo-name {
  color: #fff;
  font-size: 0.88rem;
  font-weight: 700;
  white-space: nowrap;
}

.sidebar-nav { display: flex; flex-direction: column; gap: 2px; }

.sidebar-link {
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 9px 10px;
  border-radius: 8px;
  color: var(--green-300);
  text-decoration: none;
  font-size: 0.83rem;
  font-weight: 500;
  transition: all 0.15s;
}

.sidebar-link svg { flex-shrink: 0; }

.sidebar-link:hover { color: #fff; background: rgba(255,255,255,0.06); }

.sidebar-link.router-link-active {
  color: #fff;
  background: var(--green-700);
  font-weight: 600;
}

.sidebar-bottom {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-top: 14px;
  border-top: 1px solid rgba(255,255,255,0.08);
}

.sidebar-user {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 0 8px;
  min-width: 0;
}

.sidebar-avatar {
  width: 30px; height: 30px; border-radius: 50%;
  background: var(--green-500);
  color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.65rem; font-weight: 700;
  flex-shrink: 0;
}

.sidebar-user-info { display: flex; flex-direction: column; min-width: 0; }
.sidebar-user-name {
  font-size: 0.78rem; font-weight: 600; color: #fff;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.sidebar-user-email {
  font-size: 0.66rem; color: var(--green-300);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}

.sidebar-logout {
  display: flex; align-items: center; gap: 9px;
  padding: 8px 10px;
  border-radius: 8px;
  background: none; border: none; cursor: pointer;
  color: var(--green-300);
  font-size: 0.81rem; font-weight: 500;
  transition: all 0.15s;
}
.sidebar-logout:hover { color: #fff; background: rgba(255,255,255,0.06); }

/* CONTENT WRAP */
.content-wrap {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* TOP NAV */
.top-nav {
  height: 54px;
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border-soft);
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 0 20px;
  flex-shrink: 0;
}

.tn-right { display: flex; align-items: center; gap: 6px; }

.tn-icon-btn {
  width: 32px; height: 32px;
  border-radius: 8px;
  background: none; border: 1px solid var(--color-border); cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  color: var(--color-muted); transition: all 0.15s;
}
.tn-icon-btn:hover { background: var(--color-surface-hover); }

/* PAGE AREA */
.page-area {
  flex: 1;
  overflow: hidden;
  display: flex;
}

/* RESPONSIVE */
@media (max-width: 640px) {
  .sidebar-logo-name,
  .sidebar-link span,
  .sidebar-user-info,
  .sidebar-logout span { display: none; }
  .sidebar { width: 64px; align-items: center; }
  .sidebar-logo { justify-content: center; padding: 0; }
  .sidebar-link, .sidebar-logout { justify-content: center; }
  .sidebar-user { justify-content: center; padding: 0; }
}
</style>
