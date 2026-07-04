const DashboardPage = () => {
  return (
    <section className="grid-panels">
      <article className="panel hero-panel">
        <h3>Demand Health</h3>
        <p className="stat">98.2%</p>
        <p>Forecast confidence score from latest run.</p>
      </article>
      <article className="panel">
        <h3>Open Alerts</h3>
        <p className="stat">12</p>
        <p>Variance alerts waiting for planner review.</p>
      </article>
      <article className="panel">
        <h3>Inventory Risk</h3>
        <p className="stat">Low</p>
        <p>Stockout probability remains within safe threshold.</p>
      </article>
      <article className="panel">
        <h3>Executive Summary</h3>
        <p>
          This modern shell is ready for charts, tables, and API-fed cards in the next
          implementation step.
        </p>
      </article>
    </section>
  );
};

export default DashboardPage;
