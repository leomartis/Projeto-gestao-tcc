<script setup lang="ts">
</script>

<template>
  <div class="dashboard-page">
    <aside class="dashboard-side">
      <div class="brand">
        <div class="brand-logo">G</div>
        <div>
          <span class="brand-title">GESTÃO</span>
          <span class="brand-subtitle">ONLINE</span>
        </div>
      </div>

      <div class="search-box">
        <input type="text" placeholder="Procurar opção do menu..." />
      </div>

      <nav class="side-menu">
        <router-link to="/agenda">Agenda</router-link>
        <router-link to="/estoques">Estoque</router-link>
        <router-link to="/pessoas">Pessoas</router-link>
        <router-link to="/financeiro">Financeiro</router-link>
        <router-link to="/vendas">Vendas</router-link>
        <router-link to="/rastreio">Rastreio</router-link>
      </nav>
    </aside>

    <main class="dashboard-main">
      <header class="main-header">
        <div class="header-left">
          <button class="menu-btn">☰</button>
          <div>
            <h2>Movimento Financeiro</h2>
          </div>
        </div>

        <div class="header-right">
          <span class="user-name">João Marcio Rodrigues</span>
          <span class="icon">👤</span>
          <span class="notification">🔔<span>136</span></span>
        </div>
      </header>

      <section class="stats-row">
        <article class="stat-card green">
          <span class="stat-icon">💼</span>
          <strong>350,00</strong>
          <span>A Receber Hoje</span>
        </article>
        <article class="stat-card blue">
          <span class="stat-icon">👍</span>
          <strong>1.445,90</strong>
          <span>Receb. em Atraso</span>
        </article>
        <article class="stat-card yellow">
          <span class="stat-icon">📅</span>
          <strong>2.550,00</strong>
          <span>A Pagar Hoje</span>
        </article>
        <article class="stat-card red">
          <span class="stat-icon">👎</span>
          <strong>16.922,05</strong>
          <span>Pagos em Atraso</span>
        </article>
      </section>

      <section class="table-panel">
        <div class="table-controls">
          <div class="buttons-group">
            <button>Inserir</button>
            <button>Excel</button>
            <button>Seleciona colunas</button>
            <button>Relatórios</button>
            <button class="primary">Baixar Títulos</button>
          </div>
          <div class="filter-group">
            <label>Filtrar por</label>
            <select>
              <option>Data Vencimento</option>
            </select>
            <span>valor</span>
            <select>
              <option>Este mês</option>
            </select>
          </div>
        </div>

        <table class="data-table">
          <thead>
            <tr>
              <th></th>
              <th>Categoria</th>
              <th>Vencimento</th>
              <th>Descrição</th>
              <th>Pessoa</th>
              <th>Valor</th>
              <th>Valor Devido</th>
              <th>Baixado</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>✔</td>
              <td>Vendas</td>
              <td>14/04/2018</td>
              <td>VENDA Nº 35</td>
              <td>João Marcio Rodrigues</td>
              <td>20,00</td>
              <td>20,00</td>
              <td>☐</td>
              <td>Selecione uma ação</td>
            </tr>
            <tr>
              <td>✔</td>
              <td>Vendas</td>
              <td>17/04/2018</td>
              <td>NOTA DE SERVIÇO Nº 1</td>
              <td>João Marcio Rodrigues</td>
              <td>50,00</td>
              <td>50,00</td>
              <td>☐</td>
              <td>Selecione uma ação</td>
            </tr>
            <tr>
              <td>●</td>
              <td>Aluguel</td>
              <td>18/04/2018</td>
              <td>JAILSON</td>
              <td>LUIZA</td>
              <td>5,00</td>
              <td>0,00</td>
              <td>☑</td>
              <td>Selecione uma ação</td>
            </tr>
            <tr>
              <td>✔</td>
              <td>Vendas</td>
              <td>18/04/2018</td>
              <td>VENDA Nº 110</td>
              <td>Matheus Silva</td>
              <td>15,00</td>
              <td>0,00</td>
              <td>☐</td>
              <td>Selecione uma ação</td>
            </tr>
          </tbody>
        </table>

        <div class="table-footer">
          <span>Página 4 de 7</span>
          <div class="page-controls">
            <button>Ant</button>
            <button>2</button>
            <button>3</button>
            <button class="active">4</button>
            <button>5</button>
            <button>6</button>
            <button>Seg</button>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped src="./DashboardView.css"></style>
