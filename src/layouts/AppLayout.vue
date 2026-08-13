<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
const authStore = useAuthStore()
const router = useRouter()
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
          <span class="sidebar-logo-icon">M</span>
          <span class="sidebar-logo-name">Martins</span>
          <span class="sidebar-logo-sub">Confecções</span>
        </div>

        <nav class="sidebar-nav">
          <router-link to="/dashboard" class="sidebar-link">
            <span>Painel gerencial</span>
          </router-link>
          <router-link to="/financeiro" class="sidebar-link">
            <span>Financeiro</span>
          </router-link>
          <router-link to="/vendas" class="sidebar-link">
            <span>Produção / facção</span>
          </router-link>
          <router-link to="/estoques" class="sidebar-link">
            <span>Estoque</span>
          </router-link>
          <router-link to="/pessoas" class="sidebar-link">
            <span>Pessoas</span>
          </router-link>
          <router-link to="/agenda" class="sidebar-link">
            <span>Agenda</span>
          </router-link>
        </nav>
      </div>

      <div class="sidebar-bottom">
        <button class="sidebar-logout" title="Sair" @click="logout">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          <span>Sair</span>
        </button>
      </div>
    </aside>

    <!-- RIGHT WRAP -->
    <div class="content-wrap">

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
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 20px 0;
  margin-bottom: 22px;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 8px;
  background: #fff;
}

.sidebar-logo-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px; height: 40px;
  margin-bottom: 6px;
  border-radius: 8px;
  background: var(--green-900);
  color: #fff;
  font-size: 1.05rem;
  font-weight: 800;
  flex-shrink: 0;
}

.sidebar-logo-name {
  color: var(--color-heading);
  font-size: 0.92rem;
  font-weight: 800;
  letter-spacing: 2px;
  text-transform: uppercase;
  white-space: nowrap;
}

.sidebar-logo-sub {
  color: var(--color-subtle);
  font-size: 0.58rem;
  font-weight: 600;
  letter-spacing: 2px;
  text-transform: uppercase;
}

.sidebar-nav { display: flex; flex-direction: column; gap: 2px; }

.sidebar-link {
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 9px 10px;
  border-left: 3px solid transparent;
  border-radius: 6px;
  color: var(--green-300);
  text-decoration: none;
  font-size: 0.83rem;
  font-weight: 500;
  transition: all 0.15s;
}

.sidebar-link:hover { color: #fff; background: rgba(255,255,255,0.06); }

.sidebar-link.router-link-active {
  color: #fff;
  background: var(--green-700);
  border-left-color: var(--green-300);
  font-weight: 600;
}

.sidebar-bottom {
  padding-top: 14px;
  border-top: 1px solid rgba(255,255,255,0.08);
}

.sidebar-logout {
  display: flex; align-items: center; justify-content: center; gap: 9px;
  width: 100%;
  padding: 9px 10px;
  border: 1px solid rgba(255,255,255,0.15);
  border-radius: 6px;
  background: none; cursor: pointer;
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

/* PAGE AREA */
.page-area {
  flex: 1;
  overflow: hidden;
  display: flex;
}

/* RESPONSIVE */
@media (max-width: 640px) {
  .sidebar-logo-name,
  .sidebar-logo-sub,
  .sidebar-link span,
  .sidebar-logout span { display: none; }
  .sidebar { width: 64px; align-items: center; }
  .sidebar-logo { padding: 10px 0; }
  .sidebar-link, .sidebar-logout { justify-content: center; }
}
</style>
