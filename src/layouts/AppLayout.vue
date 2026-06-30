<script setup lang="ts">
import { useAuthStore } from '../stores/authStore'
const authStore = useAuthStore()
const initials = () => authStore.user?.email?.slice(0, 2).toUpperCase() ?? 'GJ'
const logout = async () => {
  const { signOut } = await import('firebase/auth')
  const { auth } = await import('../firebase')
  await signOut(auth)
}
</script>

<template>
  <div class="app-layout">

    <!-- ICON SIDEBAR -->
    <aside class="icon-sb">
      <div class="isb-top">
        <router-link to="/dashboard" class="isb-link" title="Dashboard">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>
        </router-link>
        <router-link to="/financeiro" class="isb-link" title="Financeiro">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
        </router-link>
        <router-link to="/vendas" class="isb-link" title="Produção">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
        </router-link>
        <router-link to="/estoques" class="isb-link" title="Estoque">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
        </router-link>
        <router-link to="/pessoas" class="isb-link" title="Pessoas">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
        </router-link>
        <router-link to="/agenda" class="isb-link" title="Agenda">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        </router-link>
      </div>
      <div class="isb-bottom">
        <button class="isb-btn" title="Sair" @click="logout">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
        </button>
        <div class="isb-avatar">{{ initials() }}</div>
      </div>
    </aside>

    <!-- RIGHT WRAP -->
    <div class="content-wrap">

      <!-- TOP NAV -->
      <nav class="top-nav">
        <div class="tn-left">
          <div class="tn-logo">
            <span class="tn-logo-icon">GJ</span>
            <span class="tn-brand">Gestão Jeans</span>
          </div>
          <div class="tn-links">
            <router-link to="/dashboard"  class="tn-link">Dashboard</router-link>
            <router-link to="/financeiro" class="tn-link">Financeiro</router-link>
            <router-link to="/vendas"     class="tn-link">Produção</router-link>
            <router-link to="/estoques"   class="tn-link">Estoque</router-link>
            <router-link to="/pessoas"    class="tn-link">Pessoas</router-link>
            <router-link to="/agenda"     class="tn-link">Agenda</router-link>
          </div>
        </div>
        <div class="tn-right">
          <button class="tn-icon-btn" title="Buscar">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          </button>
          <button class="tn-icon-btn" title="Notificações">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
          </button>
          <div class="tn-user">
            <div class="tn-user-avatar">{{ initials() }}</div>
            <div class="tn-user-info">
              <span class="tn-user-name">{{ authStore.user?.email?.split('@')[0] ?? 'Usuário' }}</span>
              <span class="tn-user-email">{{ authStore.user?.email ?? '' }}</span>
            </div>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
          </div>
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
  font-family: 'Inter', 'Segoe UI', sans-serif;
  background: #f5f5f5;
}

/* ── ICON SIDEBAR ────────────────────────────────────────── */
.icon-sb {
  width: 56px;
  background: #fff;
  border-right: 1px solid #f0f0f0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
  padding: 14px 0;
}

.isb-top  { display: flex; flex-direction: column; gap: 4px; align-items: center; }
.isb-bottom { display: flex; flex-direction: column; gap: 8px; align-items: center; }

.isb-link {
  width: 36px; height: 36px;
  border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  color: #9ca3af;
  text-decoration: none;
  transition: all 0.15s;
}
.isb-link:hover { color: #374151; background: #f3f4f6; }
.isb-link.router-link-active { color: #f97316; background: #fff4ed; }

.isb-btn {
  width: 34px; height: 34px;
  border-radius: 10px;
  background: none; border: none; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  color: #9ca3af; transition: all 0.15s;
}
.isb-btn:hover { color: #ef4444; background: #fef2f2; }

.isb-avatar {
  width: 30px; height: 30px; border-radius: 50%;
  background: linear-gradient(135deg, #f97316, #fb923c);
  color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.65rem; font-weight: 700; cursor: pointer;
}

/* ── CONTENT WRAP ────────────────────────────────────────── */
.content-wrap {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* ── TOP NAV ─────────────────────────────────────────────── */
.top-nav {
  height: 54px;
  background: #fff;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  flex-shrink: 0;
}

.tn-left { display: flex; align-items: center; gap: 24px; }

.tn-logo { display: flex; align-items: center; gap: 8px; }

.tn-logo-icon {
  width: 28px; height: 28px;
  background: #f97316;
  border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.68rem; font-weight: 800; color: #fff;
}

.tn-brand { font-size: 0.88rem; font-weight: 700; color: #111827; white-space: nowrap; }

.tn-links { display: flex; align-items: center; gap: 2px; }

.tn-link {
  padding: 5px 12px;
  border-radius: 99px;
  font-size: 0.81rem;
  font-weight: 500;
  color: #6b7280;
  text-decoration: none;
  transition: all 0.15s;
  white-space: nowrap;
}
.tn-link:hover { color: #111827; background: #f3f4f6; }
.tn-link.router-link-active {
  background: #111827;
  color: #fff;
  font-weight: 600;
}

.tn-right { display: flex; align-items: center; gap: 6px; }

.tn-icon-btn {
  width: 32px; height: 32px;
  border-radius: 8px;
  background: none; border: 1px solid #e5e7eb; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  color: #6b7280; transition: all 0.15s;
}
.tn-icon-btn:hover { background: #f3f4f6; }

.tn-user {
  display: flex; align-items: center; gap: 8px;
  padding: 4px 10px 4px 4px;
  border-radius: 99px;
  border: 1px solid #e5e7eb;
  cursor: pointer; transition: background 0.15s;
  margin-left: 4px;
}
.tn-user:hover { background: #f9fafb; }

.tn-user-avatar {
  width: 26px; height: 26px; border-radius: 50%;
  background: #f97316; color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.62rem; font-weight: 700;
}

.tn-user-info { display: flex; flex-direction: column; }
.tn-user-name  { font-size: 0.75rem; font-weight: 600; color: #111827; white-space: nowrap; }
.tn-user-email { font-size: 0.62rem; color: #9ca3af; white-space: nowrap; max-width: 120px; overflow: hidden; text-overflow: ellipsis; }

/* ── PAGE AREA ───────────────────────────────────────────── */
.page-area {
  flex: 1;
  overflow: hidden;
  display: flex;
}

/* ── RESPONSIVE ──────────────────────────────────────────── */
@media (max-width: 900px) {
  .tn-links { display: none; }
}
@media (max-width: 640px) {
  .tn-user-info { display: none; }
  .icon-sb { display: none; }
}
</style>
