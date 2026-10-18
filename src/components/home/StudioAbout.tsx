import React from 'react';

export const StudioAbout: React.FC = () => {
  return (
    <section id="about" className="studio-section" aria-label="About Pixel Media">
      <div className="studio-container">
        <span className="editorial-label">About the Studio</span>

        <div className="about-split-grid">
          <div>
            <h2 className="about-statement">
              We believe great editing is invisible until it takes your breath away.
            </h2>
          </div>

          <div className="about-body-col">
            <p>
              Pixel Media is an independent creative post-production studio. We partner with commercial agencies, narrative filmmakers, and modern digital brands to shape bold, emotionally resonant visual stories.
            </p>
            <p>
              Rather than relying on formulaic templates or automated shortcuts, every project is handled with artisanal focus—carefully balancing pacing, color harmony, and sound design to ensure the final master commands attention on any screen.
            </p>

            <div className="about-pillars">
              <div className="pillar-item">
                <h4>Narrative Pacing</h4>
                <p>Every cut is placed with intention to serve emotional rhythm and story momentum.</p>
              </div>

              <div className="pillar-item">
                <h4>Color & Texture</h4>
                <p>Calibrated finishing workflows that preserve organic details and highlight subtleties.</p>
              </div>

              <div className="pillar-item">
                <h4>Sound Design</h4>
                <p>Broadcast-standard loudness and multi-layered soundscapes that enrich every frame.</p>
              </div>

              <div className="pillar-item">
                <h4>Client Transparency</h4>
                <p>Direct communication, structured revision milestones, and prompt delivery schedules.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
