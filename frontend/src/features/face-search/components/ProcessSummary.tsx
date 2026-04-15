export function ProcessSummary() {
  return (
    <section className="panel panel--summary-help">
      <div className="panel__intro">
        <p className="section-label">How to use</p>
        <h2>Face search guide</h2>
        <p className="help-text">A quick guide for running a search and reviewing matches.</p>
      </div>
      <div className="summary-help-list">
        <div className="summary-help-item">
          <p className="summary-help-item__title">1. Choose a target image</p>
          <p className="help-text">Pick the reference face you want to match in the current run.</p>
        </div>
        <div className="summary-help-item">
          <p className="summary-help-item__title">2. Add candidate images</p>
          <p className="help-text">Upload the batch to compare, then switch thumbnails to inspect each candidate.</p>
        </div>
        <div className="summary-help-item">
          <p className="summary-help-item__title">3. Adjust settings if needed</p>
          <p className="help-text">Lower Threshold for broader matches, or increase Padding for looser crops.</p>
        </div>
        <div className="summary-help-item">
          <p className="summary-help-item__title">4. Run and review</p>
          <p className="help-text">Start the search, review highlighted matches in the preview, then download crops when needed.</p>
        </div>
      </div>
    </section>
  )
}
