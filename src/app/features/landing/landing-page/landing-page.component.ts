import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LanguageService, AppLang } from '../../../core/services/language.service';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [RouterLink, TranslateModule],
  template: `
<div class="landing">

  <!-- ══════════════════ HERO ══════════════════ -->
  <section class="hero" aria-labelledby="hero-h1">
    <div class="hero-topbar">
      <div class="hero-brand">
        <svg class="hero-ball" viewBox="0 0 32 32" aria-hidden="true" focusable="false">
          <circle cx="16" cy="16" r="14" fill="none" stroke="#F5A623" stroke-width="1.5" opacity=".35"/>
          <circle cx="16" cy="16" r="14" fill="none" stroke="#F5A623" stroke-width="1.5" stroke-dasharray="4 2.5"/>
          <polygon points="16,8 20,12 19,18 13,18 12,12" fill="#F5A623" opacity=".95"/>
          <polygon points="16,4 18,7 16,10 14,7"   fill="#F5A623" opacity=".7"/>
          <polygon points="24,11 27,14 24,17 21,14" fill="#F5A623" opacity=".7"/>
          <polygon points="24,19 27,20 25,24 22,22" fill="#F5A623" opacity=".7"/>
          <polygon points="8,11 11,14 8,17 5,14"   fill="#F5A623" opacity=".7"/>
          <polygon points="8,19 10,22 8,25 5,20"   fill="#F5A623" opacity=".7"/>
          <polygon points="16,28 18,25 16,22 14,25" fill="#F5A623" opacity=".7"/>
        </svg>
        <span class="hero-brand-name">{{ 'common.appTitle' | translate }}</span>
      </div>

      <div class="lang-toggle" role="group" aria-label="Language / Idioma">
        <button
          class="lang-btn"
          [class.lang-btn--active]="currentLang() === 'es'"
          (click)="setLang('es')"
          lang="es"
          [attr.aria-pressed]="currentLang() === 'es'">
          {{ 'common.langEs' | translate }}
        </button>
        <span class="lang-sep" aria-hidden="true">/</span>
        <button
          class="lang-btn"
          [class.lang-btn--active]="currentLang() === 'en'"
          (click)="setLang('en')"
          lang="en"
          [attr.aria-pressed]="currentLang() === 'en'">
          {{ 'common.langEn' | translate }}
        </button>
      </div>
    </div>

    <div class="hero-content">
      <div class="hero-icon-wrap" aria-hidden="true">
        <svg class="hero-icon" viewBox="0 0 80 80" fill="none">
          <circle cx="40" cy="40" r="36" stroke="#F5A623" stroke-width="1.5" opacity=".25"/>
          <circle cx="40" cy="40" r="36" stroke="#F5A623" stroke-width="1.5" stroke-dasharray="6 3.5" opacity=".6"/>
          <polygon points="40,20 50,30 47,45 33,45 30,30" fill="#F5A623" opacity=".95"/>
          <polygon points="40,9  45,17 40,25 35,17"       fill="#F5A623" opacity=".72"/>
          <polygon points="61,28 68,35 60,42 53,35"       fill="#F5A623" opacity=".72"/>
          <polygon points="61,49 67,51 62,59 55,55"       fill="#F5A623" opacity=".72"/>
          <polygon points="19,28 27,35 20,42 12,35"       fill="#F5A623" opacity=".72"/>
          <polygon points="19,49 25,55 18,60 12,50"       fill="#F5A623" opacity=".72"/>
          <polygon points="40,71 45,63 40,55 35,63"       fill="#F5A623" opacity=".72"/>
        </svg>
      </div>

      <h1 id="hero-h1" class="hero-title">{{ 'common.appTitle' | translate }}</h1>
      <p class="hero-tagline">{{ 'landing.hero.tagline' | translate }}</p>

      <div class="hero-ctas">
        <a routerLink="/auth/register" class="btn btn--gold">
          {{ 'landing.hero.cta' | translate }}
        </a>
        <a routerLink="/auth/login" class="btn btn--ghost">
          {{ 'landing.hero.login' | translate }}
        </a>
      </div>

      <ul class="hero-options" role="list" [attr.aria-label]="'landing.hero.options.ariaLabel' | translate">
        <li>
          <button type="button" class="hero-option" (click)="scrollTo('what')">
            <span class="hero-option-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="9"   stroke="currentColor" stroke-width="1.6"/>
                <circle cx="12" cy="12" r="5"   stroke="currentColor" stroke-width="1.3" opacity=".55"/>
                <circle cx="12" cy="12" r="1.8" fill="currentColor"/>
              </svg>
            </span>
            <span class="hero-option-label">{{ 'landing.hero.options.predict' | translate }}</span>
          </button>
        </li>
        <li>
          <button type="button" class="hero-option" (click)="scrollTo('how')">
            <span class="hero-option-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none">
                <rect x="3"  y="14" width="4" height="7"  rx=".6" fill="currentColor" opacity=".4"/>
                <rect x="10" y="10" width="4" height="11" rx=".6" fill="currentColor" opacity=".7"/>
                <rect x="17" y="5"  width="4" height="16" rx=".6" fill="currentColor"/>
              </svg>
            </span>
            <span class="hero-option-label">{{ 'landing.hero.options.leaderboard' | translate }}</span>
          </button>
        </li>
        <li>
          <button type="button" class="hero-option" (click)="scrollTo('prizes')">
            <span class="hero-option-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M8 4h8v9c0 3-4 5-4 5s-4-2-4-5V4Z"
                      stroke="currentColor" stroke-width="1.6" fill="rgba(245,166,35,.1)"/>
                <path d="M8 7H5s-2 0-2 3 3 4 5 3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
                <path d="M16 7h3s2 0 2 3-3 4-5 3"  stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
                <rect x="10" y="18" width="4" height="3"   fill="currentColor" opacity=".8"/>
                <rect x="7"  y="20.5" width="10" height="2" rx=".6" fill="currentColor"/>
              </svg>
            </span>
            <span class="hero-option-label">{{ 'landing.hero.options.prizes' | translate }}</span>
          </button>
        </li>
      </ul>
    </div>
  </section>

  <!-- ══════════════════ WHAT IS IT ══════════════════ -->
  <section class="section section--what" id="what" aria-labelledby="what-h2">
    <div class="section-inner">
      <p class="section-eyebrow" aria-hidden="true">{{ 'landing.what.eyebrow' | translate }}</p>
      <h2 id="what-h2" class="section-heading">{{ 'landing.what.heading' | translate }}</h2>
      <p class="section-lead">{{ 'landing.what.desc' | translate }}</p>

      <div class="feature-grid">
        <!-- Predict -->
        <article class="feature-card">
          <div class="feature-icon" aria-hidden="true">
            <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="20" cy="20" r="16" stroke="#F5A623" stroke-width="2"/>
              <circle cx="20" cy="20" r="9"  stroke="#F5A623" stroke-width="1.5" opacity=".45"/>
              <circle cx="20" cy="20" r="3.5" fill="#F5A623"/>
              <line x1="20" y1="4"  x2="20" y2="11" stroke="#F5A623" stroke-width="2" stroke-linecap="round"/>
              <line x1="20" y1="29" x2="20" y2="36" stroke="#F5A623" stroke-width="2" stroke-linecap="round"/>
              <line x1="4"  y1="20" x2="11" y2="20" stroke="#F5A623" stroke-width="2" stroke-linecap="round"/>
              <line x1="29" y1="20" x2="36" y2="20" stroke="#F5A623" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </div>
          <h3 class="feature-title">{{ 'landing.what.card1Title' | translate }}</h3>
          <p class="feature-desc">{{ 'landing.what.card1Desc' | translate }}</p>
        </article>

        <!-- Score -->
        <article class="feature-card">
          <div class="feature-icon" aria-hidden="true">
            <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 4L34 10V22C34 30 20 36 20 36C20 36 6 30 6 22V10L20 4Z"
                    stroke="#F5A623" stroke-width="2" fill="rgba(245,166,35,.08)"/>
              <polygon points="20,14 21.8,18.5 26.5,18.5 22.8,21 24,25.5 20,23 16,25.5 17.2,21 13.5,18.5 18.2,18.5"
                       fill="#F5A623"/>
            </svg>
          </div>
          <h3 class="feature-title">{{ 'landing.what.card2Title' | translate }}</h3>
          <p class="feature-desc">{{ 'landing.what.card2Desc' | translate }}</p>
        </article>

        <!-- Climb -->
        <article class="feature-card">
          <div class="feature-icon" aria-hidden="true">
            <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="4"    y="24" width="7" height="12" rx="1" fill="#F5A623" opacity=".35"/>
              <rect x="16.5" y="16" width="7" height="20" rx="1" fill="#F5A623" opacity=".65"/>
              <rect x="29"   y="8"  width="7" height="28" rx="1" fill="#F5A623"/>
              <polyline points="7.5,22 20,13 32.5,6"
                        stroke="#F5A623" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <polyline points="28.5,6 32.5,6 32.5,10"
                        stroke="#F5A623" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <h3 class="feature-title">{{ 'landing.what.card3Title' | translate }}</h3>
          <p class="feature-desc">{{ 'landing.what.card3Desc' | translate }}</p>
        </article>

        <!-- Win -->
        <article class="feature-card">
          <div class="feature-icon" aria-hidden="true">
            <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M14 6H26V22C26 27 20 30 20 30C20 30 14 27 14 22V6Z"
                    fill="rgba(245,166,35,.1)" stroke="#F5A623" stroke-width="2"/>
              <path d="M14 10H8C8 10 5 10 5 15C5 20 10 22.5 14 20"
                    stroke="#F5A623" stroke-width="2" stroke-linecap="round"/>
              <path d="M26 10H32C32 10 35 10 35 15C35 20 30 22.5 26 20"
                    stroke="#F5A623" stroke-width="2" stroke-linecap="round"/>
              <rect x="18" y="30" width="4" height="5" fill="#F5A623" opacity=".75"/>
              <rect x="13" y="35" width="14" height="3" rx="1" fill="#F5A623"/>
            </svg>
          </div>
          <h3 class="feature-title">{{ 'landing.what.card4Title' | translate }}</h3>
          <p class="feature-desc">{{ 'landing.what.card4Desc' | translate }}</p>
        </article>
      </div>
    </div>
  </section>

  <!-- ══════════════════ HOW IT WORKS ══════════════════ -->
  <section class="section section--how" id="how" aria-labelledby="how-h2">
    <div class="section-inner">
      <h2 id="how-h2" class="section-heading section-heading--light">
        {{ 'landing.howItWorks.heading' | translate }}
      </h2>

      <div class="steps" role="list">
        <!-- Step 1 -->
        <div class="step" role="listitem">
          <div class="step-num" aria-hidden="true">{{ 'landing.howItWorks.step1Num' | translate }}</div>
          <div class="step-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <circle cx="9" cy="7" r="4" stroke="#F5A623" stroke-width="1.5"/>
              <path d="M2 21c0-3.866 3.134-7 7-7h2"
                    stroke="#F5A623" stroke-width="1.5" stroke-linecap="round"/>
              <line x1="18" y1="13" x2="18" y2="19" stroke="#F5A623" stroke-width="1.5" stroke-linecap="round"/>
              <line x1="15" y1="16" x2="21" y2="16" stroke="#F5A623" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          </div>
          <h3 class="step-title">{{ 'landing.howItWorks.step1Title' | translate }}</h3>
          <p class="step-desc">{{ 'landing.howItWorks.step1Desc' | translate }}</p>
        </div>

        <!-- Step 2 -->
        <div class="step" role="listitem">
          <div class="step-num" aria-hidden="true">{{ 'landing.howItWorks.step2Num' | translate }}</div>
          <div class="step-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="18" height="18" rx="2" stroke="#F5A623" stroke-width="1.5"/>
              <line x1="7" y1="8"  x2="17" y2="8"  stroke="#F5A623" stroke-width="1.5" stroke-linecap="round"/>
              <line x1="7" y1="12" x2="13" y2="12" stroke="#F5A623" stroke-width="1.5" stroke-linecap="round"/>
              <circle cx="17" cy="16" r="2.5" stroke="#F5A623" stroke-width="1.5"/>
              <line x1="17" y1="13.5" x2="17" y2="14.5" stroke="#F5A623" stroke-width="1" stroke-linecap="round"/>
            </svg>
          </div>
          <h3 class="step-title">{{ 'landing.howItWorks.step2Title' | translate }}</h3>
          <p class="step-desc">{{ 'landing.howItWorks.step2Desc' | translate }}</p>
        </div>

        <!-- Step 3 -->
        <div class="step" role="listitem">
          <div class="step-num" aria-hidden="true">{{ 'landing.howItWorks.step3Num' | translate }}</div>
          <div class="step-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <rect x="2"    y="16" width="5" height="6" rx=".5" fill="#F5A623" opacity=".38"/>
              <rect x="9.5"  y="11" width="5" height="11" rx=".5" fill="#F5A623" opacity=".65"/>
              <rect x="17"   y="6"  width="5" height="16" rx=".5" fill="#F5A623"/>
            </svg>
          </div>
          <h3 class="step-title">{{ 'landing.howItWorks.step3Title' | translate }}</h3>
          <p class="step-desc">{{ 'landing.howItWorks.step3Desc' | translate }}</p>
        </div>
      </div>
    </div>
  </section>

  <!-- ══════════════════ PRIZES ══════════════════ -->
  <section class="section section--prizes" id="prizes" aria-labelledby="prizes-h2">
    <div class="section-inner">
      <h2 id="prizes-h2" class="section-heading section-heading--light">
        {{ 'landing.prizes.heading' | translate }}
      </h2>
      <p class="section-lead section-lead--dim">{{ 'landing.prizes.sub' | translate }}</p>

      <div class="prize-grid">
        <article class="prize-card prize-card--1st">
          <span class="prize-emoji" aria-hidden="true">🏆</span>
          <h3 class="prize-rank">{{ 'landing.prizes.firstTitle' | translate }}</h3>
          <p class="prize-desc">{{ 'landing.prizes.firstDesc' | translate }}</p>
        </article>
        <article class="prize-card prize-card--2nd">
          <span class="prize-emoji" aria-hidden="true">🥈</span>
          <h3 class="prize-rank">{{ 'landing.prizes.secondTitle' | translate }}</h3>
          <p class="prize-desc">{{ 'landing.prizes.secondDesc' | translate }}</p>
        </article>
        <article class="prize-card prize-card--3rd">
          <span class="prize-emoji" aria-hidden="true">☕</span>
          <h3 class="prize-rank">{{ 'landing.prizes.thirdTitle' | translate }}</h3>
          <p class="prize-desc">{{ 'landing.prizes.thirdDesc' | translate }}</p>
        </article>
      </div>

      <p class="prizes-note">✦ {{ 'landing.prizes.note' | translate }}</p>
    </div>
  </section>

  <!-- ══════════════════ FOOTER CTA ══════════════════ -->
  <section class="section section--cta" aria-labelledby="cta-h2">
    <div class="section-inner section-inner--centered">
      <h2 id="cta-h2" class="cta-heading">{{ 'landing.footerCta.heading' | translate }}</h2>
      <p class="cta-sub">{{ 'landing.footerCta.sub' | translate }}</p>
      <div class="cta-actions">
        <a routerLink="/auth/register" class="btn btn--navy-lg">
          {{ 'landing.footerCta.btn' | translate }}
        </a>
        <a routerLink="/auth/login" class="cta-alt-link">
          {{ 'landing.footerCta.loginLink' | translate }}
        </a>
      </div>
    </div>
  </section>

</div>
  `,
  styles: [`
    /* ── Landing shell ── */
    .landing {
      overflow-x: hidden;
    }

    /* ════════════════════════════════════════
       HERO
    ════════════════════════════════════════ */
    .hero {
      position: relative;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      background-color: #071A3D;
      background-image:
        /* Left-corner floodlight beams */
        conic-gradient(
          from 295deg at -6% 112%,
          transparent 0deg,
          rgba(255,255,255,.055) 7deg, transparent 12deg,
          rgba(255,255,255,.04)  18deg, transparent 23deg,
          rgba(255,255,255,.055) 29deg, transparent 34deg,
          rgba(255,255,255,.035) 40deg, transparent 45deg,
          rgba(255,255,255,.025) 51deg, transparent 56deg,
          transparent 360deg
        ),
        /* Right-corner floodlight beams */
        conic-gradient(
          from 233deg at 106% 112%,
          transparent 0deg,
          rgba(255,255,255,.045) 7deg, transparent 12deg,
          rgba(255,255,255,.035) 18deg, transparent 23deg,
          rgba(255,255,255,.05)  29deg, transparent 34deg,
          rgba(255,255,255,.03)  40deg, transparent 45deg,
          rgba(255,255,255,.022) 51deg, transparent 56deg,
          transparent 360deg
        ),
        /* Subtle center-bottom radial glow */
        radial-gradient(ellipse 90% 55% at 50% 105%, rgba(13,43,94,.7) 0%, transparent 65%);
      color: #fff;
    }

    /* Diagonal bleed into next section */
    .hero::after {
      content: '';
      position: absolute;
      bottom: 0; left: 0; right: 0;
      height: 90px;
      background: var(--c-bg);
      clip-path: polygon(100% 0, 100% 100%, 0 100%);
      pointer-events: none;
    }

    /* ── Top bar ── */
    .hero-topbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--sp-6) var(--sp-8);
      position: relative;
      z-index: 2;
      animation: heroFade .5s ease both;
    }

    .hero-brand {
      display: flex;
      align-items: center;
      gap: var(--sp-3);
    }

    .hero-ball { width: 34px; height: 34px; flex-shrink: 0; }

    .hero-brand-name {
      font-family: var(--f-display);
      font-size: 1.35rem;
      font-weight: 800;
      letter-spacing: 2px;
      text-transform: uppercase;
      color: #fff;
    }

    /* ── Language toggle ── */
    .lang-toggle {
      display: flex;
      align-items: center;
      gap: var(--sp-2);
      background: rgba(255,255,255,.07);
      border: 1px solid rgba(255,255,255,.14);
      border-radius: var(--r-full);
      padding: 5px var(--sp-3);
    }

    .lang-btn {
      font-family: var(--f-display);
      font-size: .78rem;
      font-weight: 700;
      letter-spacing: 1.2px;
      color: rgba(255,255,255,.45);
      background: none;
      border: none;
      cursor: pointer;
      padding: 2px 4px;
      border-radius: var(--r-xs);
      transition: color var(--trans-f);
      line-height: 1;
    }

    .lang-btn:hover { color: rgba(255,255,255,.8); }
    .lang-btn--active { color: var(--c-accent) !important; }

    .lang-btn:focus-visible {
      outline: 2px solid var(--c-accent);
      outline-offset: 2px;
    }

    .lang-sep {
      color: rgba(255,255,255,.2);
      font-size: .7rem;
      user-select: none;
    }

    /* ── Hero content ── */
    .hero-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: var(--sp-12) var(--sp-6) calc(var(--sp-12) + 90px);
      position: relative;
      z-index: 1;
    }

    .hero-icon-wrap {
      margin-bottom: var(--sp-8);
      animation: heroEntrance .7s ease both;
    }

    .hero-icon {
      width: 88px; height: 88px;
      filter: drop-shadow(0 0 32px rgba(245,166,35,.45));
    }

    .hero-title {
      font-family: var(--f-display);
      font-size: clamp(2.8rem, 9vw, 6.5rem);
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: clamp(3px, .6vw, 10px);
      line-height: .95;
      color: #fff;
      margin: 0 0 var(--sp-6);
      animation: heroEntrance .7s .12s ease both;
    }

    .hero-tagline {
      font-family: var(--f-body);
      font-size: clamp(.95rem, 2.2vw, 1.25rem);
      font-weight: 400;
      color: rgba(255,255,255,.65);
      letter-spacing: .4px;
      line-height: 1.5;
      margin: 0 0 var(--sp-8);
      max-width: 520px;
      animation: heroEntrance .7s .24s ease both;
    }

    .hero-ctas {
      display: flex;
      align-items: center;
      gap: var(--sp-4);
      flex-wrap: wrap;
      justify-content: center;
      animation: heroEntrance .7s .38s ease both;
    }

    /* ── Hero feature options (3 compact pills) ── */
    .hero-options {
      list-style: none;
      margin: var(--sp-8) 0 0;
      padding: 0;
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: var(--sp-3);
      width: 100%;
      max-width: 560px;
      animation: heroEntrance .7s .5s ease both;
    }

    .hero-option {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--sp-2);
      width: 100%;
      padding: 10px 14px;
      background: rgba(255,255,255,.05);
      border: 1px solid rgba(255,255,255,.14);
      border-radius: var(--r-md);
      color: rgba(255,255,255,.82);
      font-family: var(--f-display);
      font-size: .82rem;
      font-weight: 600;
      letter-spacing: .8px;
      text-transform: uppercase;
      cursor: pointer;
      transition:
        background .18s ease,
        border-color .18s ease,
        transform .18s ease,
        color .18s ease;
    }

    .hero-option:hover {
      background: rgba(245,166,35,.12);
      border-color: rgba(245,166,35,.55);
      color: #fff;
      transform: translateY(-2px);
    }

    .hero-option:focus-visible {
      outline: 2px solid var(--c-accent);
      outline-offset: 2px;
    }

    .hero-option-icon {
      width: 18px;
      height: 18px;
      color: var(--c-accent);
      flex-shrink: 0;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    .hero-option-icon svg { width: 100%; height: 100%; }

    /* ── Buttons ── */
    .btn {
      display: inline-block;
      font-family: var(--f-display);
      font-size: 1rem;
      font-weight: 700;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      padding: 14px 32px;
      border-radius: var(--r-sm);
      text-decoration: none;
      border: 2px solid transparent;
      transition:
        transform .18s ease,
        box-shadow .18s ease,
        background .18s ease,
        border-color .18s ease;
      cursor: pointer;
      white-space: nowrap;
    }

    .btn--gold {
      background: var(--c-accent);
      color: #071A3D;
      border-color: var(--c-accent);
      box-shadow: 0 4px 22px rgba(245,166,35,.42);
    }

    .btn--gold:hover {
      background: #E09015;
      border-color: #E09015;
      transform: translateY(-2px);
      box-shadow: 0 8px 30px rgba(245,166,35,.55);
      text-decoration: none;
      color: #071A3D;
    }

    .btn--ghost {
      background: transparent;
      color: rgba(255,255,255,.82);
      border-color: rgba(255,255,255,.32);
    }

    .btn--ghost:hover {
      background: rgba(255,255,255,.1);
      border-color: rgba(255,255,255,.6);
      color: #fff;
      transform: translateY(-2px);
      text-decoration: none;
    }

    .btn--navy-lg {
      background: #071A3D;
      color: var(--c-accent);
      border-color: #071A3D;
      font-size: 1.05rem;
      padding: 16px 40px;
      box-shadow: 0 4px 22px rgba(7,26,61,.32);
    }

    .btn--navy-lg:hover {
      background: #0A2050;
      border-color: #0A2050;
      transform: translateY(-2px);
      box-shadow: 0 8px 30px rgba(7,26,61,.42);
      text-decoration: none;
      color: var(--c-accent);
    }

    /* ════════════════════════════════════════
       SHARED SECTION STRUCTURE
    ════════════════════════════════════════ */
    .section {
      position: relative;
      padding: var(--sp-16) 0;
    }

    .section-inner {
      max-width: 1100px;
      margin: 0 auto;
      padding: 0 var(--sp-8);
    }

    .section-inner--centered { text-align: center; }

    .section-eyebrow {
      font-family: var(--f-display);
      font-size: .72rem;
      font-weight: 700;
      letter-spacing: 3px;
      text-transform: uppercase;
      color: var(--c-accent-d);
      margin: 0 0 var(--sp-3);
    }

    .section-heading {
      font-family: var(--f-display);
      font-size: clamp(1.8rem, 4vw, 2.8rem);
      font-weight: 800;
      letter-spacing: -.4px;
      margin: 0 0 var(--sp-4);
      color: var(--c-text);
    }

    .section-heading--light { color: #fff; }

    .section-lead {
      font-size: 1.05rem;
      color: var(--c-text-2);
      max-width: 600px;
      line-height: 1.7;
      margin: 0 0 var(--sp-12);
    }

    .section-lead--dim { color: rgba(255,255,255,.55); }

    /* ════════════════════════════════════════
       WHAT IS IT — light section
    ════════════════════════════════════════ */
    .section--what {
      background: var(--c-bg);
      padding-top: var(--sp-16);
    }

    /* Feature cards */
    .feature-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: var(--sp-5);
    }

    .feature-card {
      background: var(--c-surface);
      border: 1px solid var(--c-border);
      border-radius: var(--r-lg);
      padding: var(--sp-8) var(--sp-6);
      position: relative;
      overflow: hidden;
      transition: transform .22s ease, box-shadow .22s ease;
    }

    .feature-card::after {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 3px;
      background: var(--c-accent);
      transform: scaleX(0);
      transform-origin: left;
      transition: transform .22s ease;
    }

    .feature-card:hover {
      transform: translateY(-5px);
      box-shadow: var(--sh-lg), 0 0 0 1px rgba(245,166,35,.25);
    }

    .feature-card:hover::after { transform: scaleX(1); }

    .feature-icon {
      width: 48px; height: 48px;
      margin-bottom: var(--sp-5);
    }

    .feature-icon svg { width: 100%; height: 100%; }

    .feature-title {
      font-family: var(--f-display);
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--c-text);
      margin: 0 0 var(--sp-3);
    }

    .feature-desc {
      font-size: var(--fs-sm);
      color: var(--c-text-2);
      line-height: 1.65;
      margin: 0;
    }

    /* ════════════════════════════════════════
       HOW IT WORKS — dark section
    ════════════════════════════════════════ */
    .section--how {
      background: #091528;
      padding-top: calc(var(--sp-16) + 60px);
      padding-bottom: var(--sp-16);
    }

    /* Diagonal bleed from previous light section */
    .section--how::before {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 60px;
      background: var(--c-bg);
      clip-path: polygon(0 0, 100% 0, 0 100%);
      pointer-events: none;
    }

    /* Steps */
    .steps {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: var(--sp-8);
      position: relative;
    }

    .steps::before {
      content: '';
      position: absolute;
      top: 28px;
      left: calc(33.33% + 16px);
      right: calc(33.33% + 16px);
      height: 2px;
      background: linear-gradient(
        90deg,
        rgba(245,166,35,.8) 0%,
        rgba(245,166,35,.25) 50%,
        rgba(245,166,35,.8) 100%
      );
      pointer-events: none;
    }

    .step {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
    }

    .step-num {
      font-family: var(--f-display);
      font-size: 3.2rem;
      font-weight: 800;
      color: var(--c-accent);
      line-height: 1;
      margin-bottom: var(--sp-5);
      position: relative;
      z-index: 1;
    }

    .step-icon {
      width: 52px; height: 52px;
      margin-bottom: var(--sp-4);
      background: rgba(245,166,35,.1);
      border: 1px solid rgba(245,166,35,.2);
      border-radius: var(--r-full);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: var(--sp-3);
      flex-shrink: 0;
    }

    .step-icon svg { width: 100%; height: 100%; }

    .step-title {
      font-family: var(--f-display);
      font-size: 1.2rem;
      font-weight: 700;
      color: #fff;
      margin: 0 0 var(--sp-3);
    }

    .step-desc {
      font-size: var(--fs-sm);
      color: rgba(255,255,255,.55);
      line-height: 1.65;
      margin: 0;
      max-width: 200px;
    }

    /* ════════════════════════════════════════
       PRIZES — darkest section
    ════════════════════════════════════════ */
    .section--prizes {
      background: #071A3D;
      border-top: 1px solid rgba(245,166,35,.12);
    }

    .prize-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: var(--sp-6);
      margin-bottom: var(--sp-8);
    }

    .prize-card {
      background: rgba(255,255,255,.04);
      border: 1px solid rgba(255,255,255,.09);
      border-radius: var(--r-lg);
      padding: var(--sp-8) var(--sp-6);
      text-align: center;
      transition: transform .22s ease, background .22s ease;
    }

    .prize-card:hover {
      transform: translateY(-5px);
      background: rgba(255,255,255,.07);
    }

    .prize-card--1st { border-color: rgba(245,166,35,.38); }
    .prize-card--2nd { border-color: rgba(192,192,192,.25); }
    .prize-card--3rd { border-color: rgba(205,127,50,.28); }

    .prize-emoji {
      display: block;
      font-size: 2.8rem;
      line-height: 1;
      margin-bottom: var(--sp-4);
    }

    .prize-rank {
      font-family: var(--f-display);
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--c-accent);
      margin: 0 0 var(--sp-3);
    }

    .prize-desc {
      font-size: var(--fs-sm);
      color: rgba(255,255,255,.55);
      line-height: 1.65;
      margin: 0;
    }

    .prizes-note {
      text-align: center;
      font-size: var(--fs-xs);
      color: rgba(255,255,255,.32);
      letter-spacing: .4px;
      font-style: italic;
      margin: 0;
    }

    /* ════════════════════════════════════════
       FOOTER CTA — gold section
    ════════════════════════════════════════ */
    .section--cta {
      background: linear-gradient(135deg, #C07010 0%, var(--c-accent) 45%, #F0BB3A 100%);
      padding: var(--sp-16) 0;
    }

    .cta-heading {
      font-family: var(--f-display);
      font-size: clamp(2rem, 5vw, 3.5rem);
      font-weight: 800;
      letter-spacing: -.3px;
      color: #071A3D;
      margin: 0 0 var(--sp-4);
    }

    .cta-sub {
      font-size: 1.05rem;
      color: rgba(7,26,61,.68);
      max-width: 500px;
      margin: 0 auto var(--sp-8);
      line-height: 1.65;
    }

    .cta-actions {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--sp-4);
    }

    .cta-alt-link {
      font-size: var(--fs-sm);
      color: rgba(7,26,61,.58);
      text-decoration: none;
      font-weight: 500;
      transition: color var(--trans-f);
    }

    .cta-alt-link:hover {
      color: #071A3D;
      text-decoration: underline;
    }

    /* ════════════════════════════════════════
       ANIMATIONS
    ════════════════════════════════════════ */
    @keyframes heroEntrance {
      from { opacity: 0; transform: translateY(24px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    @keyframes heroFade {
      from { opacity: 0; }
      to   { opacity: 1; }
    }

    @media (prefers-reduced-motion: reduce) {
      .hero-topbar,
      .hero-icon-wrap,
      .hero-title,
      .hero-tagline,
      .hero-ctas,
      .hero-options { animation: none !important; }

      .feature-card,
      .prize-card,
      .hero-option { transition: none !important; }
    }

    /* ════════════════════════════════════════
       RESPONSIVE
    ════════════════════════════════════════ */
    @media (max-width: 960px) {
      .feature-grid { grid-template-columns: repeat(2, 1fr); }
    }

    @media (max-width: 720px) {
      .hero-topbar  { padding: var(--sp-4) var(--sp-4); }
      .hero-content { padding: var(--sp-8) var(--sp-4) calc(var(--sp-8) + 90px); }
      .hero-icon    { width: 68px; height: 68px; }
      .section-inner { padding: 0 var(--sp-4); }

      .hero-options {
        grid-template-columns: 1fr;
        max-width: 280px;
        gap: var(--sp-2);
        margin-top: var(--sp-6);
      }

      .steps {
        grid-template-columns: 1fr;
        gap: var(--sp-6);
      }
      .steps::before { display: none; }
      .step {
        flex-direction: row;
        text-align: left;
        align-items: flex-start;
        gap: var(--sp-5);
      }
      .step-num { font-size: 2.4rem; min-width: 54px; margin-bottom: 0; }
      .step-desc { max-width: none; }

      .prize-grid {
        grid-template-columns: 1fr;
        max-width: 340px;
        margin-left: auto;
        margin-right: auto;
      }
    }

    @media (max-width: 480px) {
      .hero-brand-name { font-size: 1.1rem; letter-spacing: 1.5px; }
      .hero-ctas { flex-direction: column; width: 100%; max-width: 280px; }
      .btn { text-align: center; padding: 13px 24px; }
      .feature-grid { grid-template-columns: 1fr; gap: var(--sp-4); }
    }
  `],
})
export class LandingPageComponent implements OnInit {
  private langSvc = inject(LanguageService);
  private translate = inject(TranslateService);
  private titleSvc = inject(Title);

  readonly currentLang = this.langSvc.currentLang;

  constructor() {
    this.translate.onLangChange
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.syncTitle());
  }

  ngOnInit(): void {
    this.syncTitle();
  }

  setLang(lang: AppLang): void {
    this.langSvc.setLang(lang);
  }

  scrollTo(id: string): void {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  private syncTitle(): void {
    this.titleSvc.setTitle(this.translate.instant('landing.pageTitle'));
  }
}
