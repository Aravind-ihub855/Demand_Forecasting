const ForecastsPage = () => {
  return (
    <section className="stack-panels">
      <article className="panel">
        <h3>Forecast Pipeline</h3>
        <p>Model queue, run schedule, and status cards (static for now).</p>
      </article>
      <article className="panel">
        <h3>Scenario Simulator</h3>
        <p>What-if simulation block for pricing, seasonality, and stock shifts.</p>
      </article>
      <article className="panel">
        <h3>Approval Queue</h3>
        <p>Placeholder approval workflow cards for planners and managers.</p>
      </article>
    </section>
  );
};

export default ForecastsPage;
