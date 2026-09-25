# The Energy-Knowledge Economy: Tokenizing Differential Rent in Decentralized AI Knowledge Production

能量知识经济：去中心化 AI 知识生产中的级差地租代币化

*Working Paper v1.0 · 2026-09-25*

> Status: v1.0 working paper. The model, seven propositions, numerical simulations, and references are finalized; some empirical citations (marked †) come from the 2026-09-25 literature sweep and must be re-verified against the originals before journal submission. All numerical parameters are placeholders pending final confirmation; v2.0 will incorporate real MVP/Phase-1 data for calibration.

---

## Abstract

This paper proposes a closed-loop decentralized AI knowledge-production mechanism: **electricity (kWh) is the only real cost; AI expends electricity to produce verifiable knowledge and earns token rewards; other AIs purchase knowledge queries with tokens, and query fees flow back into the reward pool (treasury)**. The geographic dispersion of global electricity prices endogenously generates geographic arbitrage in this mechanism — production flows automatically to low-price regions, where miners capture "electricity differential rent." This paper gives five operational mechanism formulas: (1) the miner entry condition; (2) the convex quality reward; (3) the protocol-profitability constraint and base-reward calibration iron law; (4) quality-threshold difficulty adjustment; (5) regional spread capture; plus an exponential depreciation rule for knowledge rents (corresponding to the "moral depreciation" of *Capital*). This paper proves seven propositions: geographic-sorting equilibrium, the calibration iron law, geometric-convergence stability of difficulty adjustment, and the energy-anchor soft floor; and **newly derives** the necessary and sufficient condition for the optimal regional capture coefficient $\delta^*$ ($\delta = 0$ in Phase 1 is *proven* optimal, not assumed), the first-order condition for the optimal knowledge depreciation rate, and the optimal query fee (static inverse-hazard-rate pricing + steady-state dynamic optimum + cold-start low-fee corollary). Numerical simulations (§7) verify the theoretical predictions on geographic sorting, difficulty-adjustment convergence, and the corner/interior solutions for $\delta^*$. This paper is the first formalization of the "electricity–knowledge–token" closed loop, filling the gap between energy-money thought, geographic-arbitrage mining, and tokenized knowledge markets — as confirmed by the 2026-09-25 web-wide literature sweep (see §2 and `LITERATURE_SWEEP.md`).

Keywords: differential rent; energy currency; knowledge mining; mechanism design; token economics; moral depreciation

---

## 1. Introduction

Three observations:

1. **The real cost of AI is electricity.** No matter how advanced the model, inference and training ultimately settle in kilowatt-hours. Electricity is the only input in the AI economy that is unforgeable and cannot be conjured from nothing.
2. **Global electricity prices are discretely dispersed.** Prices differ across countries by up to an order of magnitude, and are naturally decoupled from where knowledge is produced — knowledge is a digital good; its place of production and place of consumption can be separated.
3. **Knowledge is a capital good, not a consumption good.** A high-quality piece of knowledge can be queried countless times; its value erodes over time through displacement by new knowledge (what Marx called the "moral depreciation" of fixed capital), rather than being "used up."

Existing literature each touches one piece (the intellectual history of energy money, Bitcoin-as-energy-money, proofs of useful work, empirical miner migration, data/knowledge markets), but no one has closed the pieces into a **loop**: electricity → knowledge → tokens → query fees → electricity. This paper's contribution is the first computable, deployable mechanism design for that loop.

**A note on naming**: the term "knowledge mining" has already been used by OriginTrail (OT-RFC-20, 2023) for its knowledge-graph contributor rewards; to avoid confusion, this paper uses "energy-knowledge economy (*energy-anchored* knowledge mining)" for the present mechanism. Notably: even the coiners of the term did not build the closed loop of this paper.

---

## 2. Literature Review

*The literature sweep (2026-09-25, six tracks; see `LITERATURE_SWEEP.md`) confirms: every component of the loop has been explained clearly by someone — but no paper, no project, and no person has strung all six components into one chain.*

### 2.1 The intellectual history of energy money

From Henry Ford (1921) — "a certain amount of energy exerted for one hour equals one dollar" — to Technocracy Inc. (1932–33) and its energy certificates (non-tradable, expiring), to DeKo (2011; 1 DeKo ≈ 10 kWh of delivered electricity), the intellectual history of "energy as money" is long. The closest to "electricity as money — issuable and tradable" is **E-Stablecoin** (Murialdo & Belof, Lawrence Livermore National Laboratory, *Cryptoeconomic Systems*, 2022): mint 1 token per 1 kWh of input, redeem 1 kWh on burn, explicitly noting in the mechanism that one can **mint in low-electricity-price regions and burn in high-price regions** — the first time geographic arbitrage was written into an energy-money mechanism. But E-Stablecoin's consumption side is electricity itself; it has no knowledge-production link.

The adversarial lineage must be confronted head-on: **Georgescu-Roegen** (*The Entropy Law and the Economic Process*, 1971) explicitly rejected reducing economic value to energy — low entropy is a necessary, not sufficient, condition for value. The kWh can serve as a stable unit of account, but it does not explain prices. This mechanism's answer is in §8: what energy anchors is *production cost*, not value.

### 2.2 Bitcoin as energy money and the production-cost soft floor

The academic origin is **Adam Hayes**'s (2015→2019) production-cost model: electricity price × energy efficiency × difficulty form a "gravitational line" for the coin price; **Charles Edwards** (Capriole, 2019) gave the only formalized version: `Energy Value = joules × fixed fiat factor`. JPMorgan uses the **"soft floor"** framing (September 2026 estimate ≈ $85,000). The theoretical foundation is **Szabo**'s (2002) *unforgeable costliness*: what is anchored is not "stored energy" (the energy has already dissipated as heat), but the **unforgeability of the expenditure process**. Contrarian empirics (Kristoufek 2020 et al.) suggest the causal arrow runs more from price to cost — which is precisely why this paper says "soft floor" rather than "hard floor."

### 2.3 Proofs of useful work (PoUW)

From Ball et al.'s (2017) formalization, to Proof-of-Search (Shibata 2019 — clients pay for "solutions," the closest academic prototype of "knowledge for tokens"), to Bittensor (the largest-scale instance of AI useful output for tokens, though validation is subjective peer review) and **Allora** (workers produce inference, users pay per query on a pay-what-you-want basis, fees split among producers by quality — **isomorphic** to this paper's model). The field faces an **impossible trinity**: open-ended knowledge output / decentralized low-cost verification / genuine paid demand — no one achieves all three; and Ball et al. (2020), "Proofs of Useless Work," deliver a negative result: verification costs that are too high degenerate back into centralization. This mechanism's answer is: **verify no energy consumption — verify only knowledge quality and query authenticity** (staking + review + query fees), shifting verification costs to the domain where AI excels (see §8).

### 2.4 Empirical evidence on geographic electricity-price arbitrage

Cambridge CCAF (2025): miners' median electricity cost $0.045/kWh, electricity 80%+ of cash costs — and the sentence in the entire literature closest to rent theory: the product sells at a global uniform price, so competition revolves entirely around cost management. Sang et al.'s (2022) RDF model is the only paper to write "electricity-price spread → migration decision → profit spread" as an explicit function; the Texas ERCOT empirical study (2026) confirms `profit = hashprice × hashrate − electricity price × power draw`. But **every paper treats the electricity-price spread as a "cost item" or a "siting explanatory variable"; none elevates it into a theoretical framework of "capturable rent"** — a gap.

### 2.5 Tokenized knowledge/data markets

**Vana** whitepaper (2024-12): each inference call burns model tokens, 30% to data contributors — the only design to write "per-call → automatic producer payout" into the mechanism (implementation status unverified; and it is human data with no energy anchor). **OriginTrail** coined the term "knowledge mining" (OT-RFC-20, 2023); its OT-RFC-27 (2026-09) meters and settles queries in TRAC, but producer incentives (NEURO) and query consumption (TRAC) are two money flows that were never connected. Tokenized RAG knowledge bases are a blank space in crypto.

### 2.6 Differential rent enters crypto

The precise connection "cheap electricity = fertile land = differential rent" has appeared in public exactly **once**: **Joost de Valk** (2026-04-24) — "The 'fertile land' of our era is cheap, abundant, low-carbon electricity… This is Ricardo, in 2026, in datacentres." But he used it for AI-datacenter cost observation, self-described as a heuristic, with **no token-mechanism design whatsoever**. The remaining literature (Prat & Walter 2019, "MEV as rent") discusses monopoly rents, not differential rent.

### 2.7 The novelty gap

Welding "energy minting + geographic arbitrage" (the E-Stablecoin side) together with "AI-produced knowledge + pay-per-query revenue sharing" (the Allora/Vana side), via differential-rent theory, into one complete production chain "electricity → knowledge → TOKEN → query → reflux," and writing rent, quality, and depreciation all as tunable-parameter profit formulas — **this combination and formalization is new**. This paper stands on the shoulders of E-Stablecoin, Hayes/Edwards, Allora, Vana, and de Valk, completing the last leg of the journey none of them finished.

---

## 3. Model

### 3.0 Notation

| Symbol | Meaning |
|---|---|
| $r$ | Region index |
| $P_r$ | Electricity price in region $r$ ($/kWh); $P_{ref}$ reference price, $P_c$ price in the cheap-electricity concentration region |
| $E_j$ | Energy consumed to produce knowledge card $j$ (kWh) |
| $Q_j$ | Quality score of card $j$ $[0,100]$; $Q_{\min}$ quality threshold, $Q_{floor}$ downward-adjustment floor |
| $R_0$ | Base reward (tokens); $R_j$ actual reward of card $j$ |
| $p$ | Token market price (fiat-denominated) |
| $c_{ops}$ | Per-card operating cost; $C_{ops}$ total protocol operating cost |
| $f$ | Per-query fee (fiat-denominated) |
| $q_j$ | Lifetime query volume of card $j$ (realized); $\hat{q}$ its conservative estimate |
| $\theta_0$ | Creator initial revenue-share; $\theta_j(t)$ time-varying share; $\bar{\theta}$ average share |
| $\beta$ | Quality convexity exponent; $\lambda$ knowledge depreciation rate; $\delta$ regional-spread capture coefficient |
| $\kappa$ | Calibration safety margin; $\rho^*$ expenditure/income ratio target; $\alpha$ difficulty-adjustment step size |
| $\pi_r$ | Differential rent in region $r$ |

Specialized symbols introduced in Propositions 6–7 ($e, \gamma, c_0, A, \mu, V(e,\lambda), n(\lambda), w, G, g, \bar{v}, M, K, \eta, \varphi, d$) are defined within each proposition and do not enter the global notation table.

### 3.1 Participants

- **Miners (knowledge producers)**: located in region $r$, facing electricity price $P_r$; expending energy $E_j$ to produce knowledge card $j$ of quality $Q_j \in [0,100]$.
- **Queriers**: AI agents buying knowledge queries at unit price $f$, generating demand $q_j$.
- **Protocol**: issues rewards, manages the reward pool, and executes quality review and difficulty adjustment. Protocol revenue comes from query fees; expenditure is knowledge rewards.

### 3.2 Reward rules

**Formula 1 · Entry condition (endogenous geographic arbitrage)**

$$R_j \cdot p > E_j \cdot P_r + c_{ops}$$

where $R_j$ is the token reward amount, $p$ the token market price, and $c_{ops}$ the operating cost. Key design choice: a **globally uniform reward** ($R_j$ does not vary by region). Hence for any two regions $r_1, r_2$ with $P_{r_1} < P_{r_2}$, miners in $r_1$ always enjoy a higher profit margin — production flows automatically to low-electricity-price regions, and the protocol captures geographic sorting **without verifying miner locations**.

**Formula 2 · Convex quality reward**

$$R_j = R_0 \cdot \max\left(0, \frac{Q_j - Q_{\min}}{100 - Q_{\min}}\right)^{\beta}, \quad \beta > 1$$

$\beta \approx 2$ (placeholder). Convexity gives high-quality knowledge superlinear rewards; anything below $Q_{\min}$ earns zero. Combined with staking and slashing, the expected return of junk content is negative.

**Formula 3 · Protocol profitability and the calibration iron law**

$$\Pi = \sum_j q_j \cdot f \cdot (1 - \bar{\theta}) - \sum_j R_j - C_{ops}$$

$$R_0 = \kappa \cdot \left(1 - \frac{\theta_0}{2}\right) \cdot \hat{q} \cdot f, \quad \kappa \approx 0.5 \text{ (placeholder)}$$

The creator revenue share depreciates exponentially over time:

$$\theta_j(t) = \theta_0 \cdot e^{-\lambda t}$$

This is the formalization of knowledge capital's "moral depreciation": the value of knowledge is not consumed but **rendered obsolete by new knowledge**. $\lambda$ comes in three tiers by knowledge category (fast/medium/slow).

**Formula 4 · Quality-threshold difficulty adjustment**

$$\frac{\text{reward expenditure}}{\text{query revenue}} > \rho^* \Rightarrow Q_{\min} \uparrow; \quad \text{review queue empty for a long time} \Rightarrow Q_{\min} \downarrow \text{ (floored)}$$

The knowledge-version of Bitcoin's difficulty adjustment: what is adjusted is not hash difficulty but the **quality bar**, hedging the reflexivity of the token price (price spike → reward-value spike → junk influx).

**Formula 5 · Regional spread capture (Phase 2; default $\delta = 0$)**

$$R_j(r) = R_j \cdot \left(\frac{P_r}{P_{ref}}\right)^{\delta}$$

$\delta = 0$ leaves all geographic arbitrage to miners (Phase-1 launch state); $\delta \in (0,1)$ splits it between miners and the protocol. $\delta > 0$ requires trusted regional verification — an open problem (see §8).

### 3.3 The energy anchor

$$1 \text{ PIKO} \equiv \frac{E_{benchmark}}{R_0} \text{ kWh} \ @ \ P_{ref}$$

A production-cost **soft floor**: when the market price falls below production cost, miners halt, new reward supply contracts, while the installed knowledge base keeps generating query fees — the rising yield brings buyers back. **This is a soft floor, not a hard peg**, and must never be described externally as "pegged".

---

## 4. Equilibrium and Propositions

**Proposition 1 (Geographic-sorting equilibrium).** Under a globally uniform reward ($\delta = 0$), knowledge production concentrates in equilibrium in the lowest-electricity-price regions; miners in low-price regions capture positive differential rent $\pi_r = R_j p - E_j P_r - c_{ops}$, with $\pi_r$ strictly decreasing in $P_r$.

*Proof sketch.* By Formula 1, miner $i$'s participation constraint in region $r$ is $R_j p - E_j P_r - c_{ops} > 0$. Since $R_j$ is independent of $r$, the profit function is strictly decreasing in $P_r$. Under free entry, marginal miners in high-price regions exit first, production concentrates in low-price regions, until the marginal profit in the lowest-price region is driven to zero. ∎

**Proposition 2 (Sustainability / calibration iron law).** If the base reward satisfies $R_0 \leq \kappa \cdot (1 - \theta_0/2) \cdot \hat{q} \cdot f$ and $\hat{q}$ is a conservative estimate of lifetime queries, then the protocol's long-run expected surplus satisfies $\mathbb{E}[\Pi] \geq -C_{ops}$.

*Proof sketch.* Expected query revenue per card is $\hat{q} f (1 - \bar{\theta})$, where $\bar{\theta} \approx \theta_0/2$ (mean approximation of exponential depreciation). $\kappa < 1$ leaves a safety margin to absorb estimation error. Summing over all cards gives the result. ∎

**Proposition 3 (Difficulty-adjustment stability).** Suppose a token-price shock doubles $R_j p$; then Formula 4, by raising $Q_{\min}$, makes reward-expenditure growth fall below query-revenue growth, returning the system to the $\Pi \geq 0$ region.

*Proof.* Let $s_t$ be the expenditure/income ratio in period $t$, with $s(Q)$ strictly decreasing in $Q_{\min}$ and Lipschitz constant $L$ (the convex reward $\beta > 1$ guarantees: raising $Q_{\min}$ shrinks expenditure superlinearly while the high-quality cards that drive queries are retained, so $|s'|$ has a positive lower bound $c > 0$). The dynamics are $Q_{t+1} = Q_t + \alpha \max(0, s_t - \rho^*)$ (the downward branch has floor $Q_{floor}$, which does not affect the stability argument). If $s_t > \rho^*$, then

$$s_{t+1} - \rho^* \approx (s_t - \rho^*) + s'(Q_t)\cdot \alpha (s_t - \rho^*) = (s_t - \rho^*)\left(1 - \alpha|s'(Q_t)|\right).$$

Taking step size $\alpha < 1/L$ gives $0 < 1 - \alpha|s'| < 1$, so the excess $s_t - \rho^*$ **converges geometrically** to 0, in $O(\log(1/\epsilon)/\log(1/(1-\alpha c)))$ steps. After a token-price shock ($R_j p$ doubles → $s_t$ jumps → low-quality influx), the system returns to a neighborhood of $\rho^*$ in finite steps — this is the mathematical content of hedging token-price reflexivity. ∎

*Remark.* $\alpha < 1/L$ is the iron law that "the adjustment step must not exceed the reciprocal of the system's sensitivity" — adjusting too aggressively causes oscillation. This matches the intuition behind Bitcoin retargeting only every 2016 blocks, except here it is given as an analytic condition.

*Remark 2 (Lag and oscillation).* The proof above assumes adjustments take effect immediately. In reality miner entry/exit has a one-period lag ($s_t = s(Q_{t-1})$), turning the dynamics into cobweb form: small $\alpha$ still converges smoothly, while overly large $\alpha$ produces oscillation (numerical simulation §7.2). $\alpha < 1/L$ is therefore not only a convergence condition but an anti-oscillation safety band.

**Proposition 4 (Energy-anchor soft floor).** Let production cost be $c = E_{benchmark} P_{ref} / R_0$ (in fiat terms). When $p < c$, rational miners halt, new reward supply falls to zero, while the query yield of the installed knowledge base, $f \cdot q / p$, rises as $p$ falls.

*Proof sketch.* By Formula 1, when $p < c$ the participation constraint fails for all miners. Query demand $q$ for installed knowledge is independent of $p$ (queries are priced in fiat at $f$), so the token-denominated yield $fq/p$ rises, attracting buyers. ∎

**Proposition 5 (Optimal regional-spread capture coefficient).** Suppose production concentrates in the low-electricity-price region (Proposition 1), where the regional price is $P_c < P_{ref}$, potential miner supply is $N(\delta)$ (decreasing and differentiable in $\delta$), and expected query revenue per card is $f\hat{q}(1-\bar{\theta})$ (in fiat). Protocol profit is

$$\Pi(\delta) = N(\delta)\left[f\hat{q}(1-\bar{\theta}) - R_0 p\left(\frac{P_c}{P_{ref}}\right)^{\delta}\right], \quad \delta \in [0,1]$$

Then: (i) $\delta^* = 0$ is optimal if and only if miner supply is sufficiently elastic, i.e.,

$$-\frac{N'(0)}{N(0)} \geq \frac{R_0 p \ln(P_{ref}/P_c)}{f\hat{q}(1-\bar{\theta}) - R_0 p};$$

(ii) if electricity-price dispersion is large enough (large $P_{ref}/P_c$) and miner supply is inelastic, there exists an interior optimum $\delta^* \in (0,1)$ satisfying the first-order condition

$$-\frac{N'(\delta^*)}{N(\delta^*)} = \frac{R_0 p (P_c/P_{ref})^{\delta^*} \ln(P_{ref}/P_c)}{f\hat{q}(1-\bar{\theta}) - R_0 p (P_c/P_{ref})^{\delta^*}}.$$

*Proof sketch.* Differentiating $\Pi(\delta)$:

$$\Pi'(\delta) = N'(\delta)\cdot m(\delta) + N(\delta)\cdot R_0 p\left(\frac{P_c}{P_{ref}}\right)^{\delta}\ln\frac{P_{ref}}{P_c},$$

where $m(\delta) = f\hat{q}(1-\bar{\theta}) - R_0 p(P_c/P_{ref})^{\delta}$ is per-card marginal profit ($m > 0$ by Proposition 2). The first term is negative (the loss from crowding out miners by raising $\delta$); the second is positive (rent captured from incumbent miners). $\Pi'(0) \leq 0$ holds if and only if condition (i) holds, giving the corner solution $\delta^* = 0$; otherwise $\Pi'(0) > 0$ and, as $\delta \to 1$, the tightening participation constraint drives $N \to 0$, so by continuity an interior optimum exists, and rearranging the first-order condition yields (ii). ∎

**Corollary (Why $\delta = 0$ in Phase 1).** In the cold-start phase, miner supply is highly elastic (global AI compute enters and exits freely) and verifiable electricity-price dispersion is limited, so condition (i) holds — $\delta = 0$ is not a simplifying assumption but the **optimal choice**. Enabling $\delta > 0$ in Phase 2 requires observing miner supply becoming inelastic (sunk costs, ecosystem lock-in) or verifiable price dispersion widening. This turns de Valk's heuristic analogy into an executable mechanism parameter.

**Proposition 6 (Optimal knowledge depreciation rate).** Suppose a creator chooses effort $e \geq 0$, quality $Q(e) = 1 - e^{-\gamma e}$, cost $c(e) = \frac{c_0}{2}e^2$; initial query rate $q_0(e) = A\cdot Q(e)$, natural decay rate of query demand $\mu$, and the creator's share depreciates at rate $\lambda$. Then:

(i) The creator's lifetime rent has a closed form
$$V(e,\lambda) = \theta_0 f \int_0^\infty q_0(e)\,e^{-(\mu+\lambda)t}dt = \frac{\theta_0 f A\, Q(e)}{\mu+\lambda};$$

(ii) The creator's optimal effort $e^*(\lambda)$ is uniquely determined by the first-order condition
$$\frac{\theta_0 f A \gamma e^{-\gamma e^*}}{\mu+\lambda} = c_0 e^*,$$
and $e^*(\lambda)$ is strictly decreasing in $\lambda$ (faster depreciation, less effort);

(iii) Suppose knowledge is produced in cohorts: higher $\lambda$ means old-cohort rents flow back to the protocol faster, so the number of new cohorts the protocol can fund per period, $n(\lambda)$, is larger ($n' > 0$, faster budget recycling); but per-cohort effort $e^*(\lambda)$ is lower, so per-cohort welfare $w(e^*)$ is smaller. Steady-state total welfare is $W(\lambda) = n(\lambda)\cdot w(e^*(\lambda))$, and the optimal depreciation rate $\lambda^*$ satisfies

$$\frac{n'(\lambda^*)}{n(\lambda^*)} = -\frac{1}{w}\frac{dw}{d\lambda}\Big|_{\lambda^*},$$

i.e., **the marginal gain from funding more cohorts equals the marginal loss from lower per-cohort quality**. The creator participation constraint $\theta_0 f A Q(e^*)/(\mu+\lambda^*) \geq c(e^*)$ gives an upper bound on $\lambda$.

*Proof sketch.* (i) Direct integration. (ii) $V$ is concave in $e$ ($Q$ concave, $c$ convex); in $\partial V/\partial e = c'(e)$ the left side decreases in $e$ while the right side increases, so the crossing is unique; raising $\lambda$ shifts the left curve down, lowering $e^*$. (iii) Differentiate $W(\lambda)$ and set to zero; $n' > 0$ comes from the budget constraint — the faster old rents flow back, the more new cards can be funded. ∎

*Remark.* Estimating $(A, \gamma, c_0, \mu)$ requires real query data from the MVP/Phase 1 — precisely the task of the empirical v2.0. Until then, the three placeholder tiers of $\lambda$ (fast/medium/slow) may be viewed as prior guesses for $\lambda^*$.

**Proposition 7 (Optimal query fee).** Let total potential query volume be $M$, per-query value $v \sim G$ (density $g$, support $[0, \bar{v}]$); a querier buys if and only if $v \geq f$. Then:

(i) **Static optimum**: the protocol's single-period query revenue $R(f) = fM(1-G(f))$ is maximized at the fee satisfying the inverse-hazard-rate condition
$$f^* = \frac{1-G(f^*)}{g(f^*)};$$
in particular, for $v \sim U[0,\bar{v}]$, $f^* = \bar{v}/2$ (classic monopoly pricing);

(ii) **Dynamic optimum (steady state)**: let the knowledge stock $K$ affect potential query volume via $M(K) = M_0 K^\eta$ ($\eta \in (0,1)$), with steady-state condition $K = \varphi \cdot fM(K)(1-G(f))$ ($\varphi$ the share of revenue reinvested into rewards). Then steady-state protocol revenue $\Pi(f) \propto [\,f(1-G(f))\,]^{1/(1-\eta)}$, whose maximization **coincides** with the static problem — under this specification $f^* = \bar{v}/2$ (uniform distribution); reinvestment is a multiplicative scaling that does not move the optimum;

(iii) **Cold-start corollary**: when the initial knowledge stock $K_0$ lies far below the steady state $K^*(\bar{v}/2)$, the optimal path first sets $f < \bar{v}/2$ to accelerate knowledge-base accumulation (sacrificing current revenue for $K$ growth), then returns to $\bar{v}/2$ near the steady state. This matches the phased design of Phase 1 (low fees for user acquisition, subsidized growth) → Phase 2 (normal pricing).

*Proof sketch.* (i) $R'(f) = M[(1-G(f)) - fg(f)] = 0$ rearranges to the condition; the second-order condition follows from log-concavity of $G$ (trivially true for the uniform). (ii) The steady-state condition gives $K^*(f) = [\varphi M_0 f(1-G(f))]^{1/(1-\eta)}$; substituting into $\Pi(f) = fM_0(K^*)^\eta(1-G(f))$ yields $\Pi \propto [f(1-G(f))]^{1/(1-\eta)}$; the exponent $1/(1-\eta) > 0$ is monotone, so the argmax coincides with (i). (iii) Transition dynamics $K_{t+1} = (1-d)K_t + \varphi f_t M(K_t)(1-G(f_t))$; when $K_t$ is small, the marginal social value of $K$ exceeds the marginal value of current revenue (large $\partial W/\partial K$), hence optimal $f_t < \bar{v}/2$; as $K_t \to K^*$ we return to (ii). The full optimal-control path is left to a future version. ∎

*Remark.* $\bar{v}$ (the upper bound of query value) and $\eta$ (the knowledge-stock elasticity) must be identified from real MVP/Phase-1 query data — $f$ remains a placeholder parameter to this day, but now with an explicit identification strategy: estimate $G$ from query-volume-vs-price experiments, and $\eta$ from knowledge-base-growth vs query-volume regressions.

---

## 5. The Moral Depreciation of Knowledge: A Dialogue with *Capital*

In Volume 2 of *Capital*, Marx discusses the "moral depreciation" of fixed capital: a machine loses value not through use but through the **arrival of better machines**. Knowledge is the extreme case of this logic — a piece of knowledge can be queried infinitely often with no physical wear; its value decays almost entirely through displacement by new knowledge.

This mechanism formalizes the insight as $\theta_j(t) = \theta_0 e^{-\lambda t}$: the creator's share of query fees decays exponentially over time. This simultaneously resolves a classic token-economics dilemma: under a **perpetual-royalty regime**, early knowledge collects rent forever, latecomers find no profit, and the system ossifies; under a **zero-royalty regime**, no one produces. Exponential depreciation is the continuum between the two, with $\lambda$ as the dial.

---

## 6. Parameter Calibration

| Parameter | Meaning | Placeholder | Calibration method (pending MVP data) |
|---|---|---|---|
| $R_0$ | Base reward | TBD | Backed out from the iron law, $\kappa=0.5$ |
| $f$ | Per-query fee | TBD | Query demand elasticity experiments |
| $\theta_0$ | Creator initial share | 0.3 | — |
| $\lambda$ | Depreciation rate (three tiers) | 0.5/0.15/0.03/month | Fit from the $q(t)$ decay curve |
| $\beta$ | Quality convexity | 2 | — |
| $Q_{\min}$ | Quality threshold | 60 | Feedback from the expenditure/income ratio |
| $\kappa$ | Safety margin | 0.5 | — |
| $\delta$ | Regional spread capture | 0 (Phase 1) | Phase 2 subject to regional-verification trustworthiness |
| $P_{ref}$ | Reference electricity price | $0.10/kWh | Near the global median electricity price |

**Calibration iron law, restated**: rewards must be backed out from conservatively estimated future query revenue — never set rewards first and hope for demand later. This is the most fundamental difference between this mechanism and every "mint first, find demand later" model.

---

## 7. Numerical Simulations

All simulation parameters below are illustrative values, used to verify the direction and shape of the theoretical predictions; they do not constitute calibration. Simulation code is in this directory (`sim1_sorting.py`, `sim2_stability.py`, `sim3_delta.py`) and is reproducible.

### 7.1 Geographic sorting (Proposition 1)

Ten regions with electricity prices $0.02–0.30/kWh; 200 potential miners per region with energy efficiency $E \sim U[20,80]$ kWh/card; globally uniform reward $R_0 = 100$ tokens, $p = \$0.10$.

![Figure 1](figures/sim1_sorting.png)

Result: the 6 regions with prices $\leq \$0.09$ are fully subscribed (200/200); only 29 miners enter at $\$0.30$; the 3 cheapest regions concentrate 37.6% of miners; total regional rent strictly decreases with price ($\$1,602 \to \$48$). **Geographic arbitrage requires the protocol to know no miner's location** — Proposition 1's sorting equilibrium is replicated exactly in simulation.

### 7.2 Convergence and oscillation of difficulty adjustment (Proposition 3)

After a token-price shock the expenditure/income ratio is $s_0 = 2.5$ (target $\rho^* = 1$), $s(Q) = 2.5e^{-0.06(Q-60)}$, with a realistic one-period implementation lag (miners decide on last period's threshold).

![Figure 2](figures/sim2_stability.png)

Result: under a gentle step size ($\alpha = 0.8$), $s_t$ converges smoothly and geometrically to $\rho^*$; under an aggressive step size ($\alpha = 8.0$), cobweb-style oscillation appears (eventually damped, but deviating far from target over the first 20 periods). **$\alpha < 1/L$ is not only a convergence condition but an anti-oscillation safety band** — precisely the content of Remark 2 of Proposition 3.

### 7.3 Optimal regional capture coefficient (Proposition 5)

$P_c = \$0.03$, $P_{ref} = \$0.10$, $R_0 p = \$10$, per-card query revenue $f\hat{q}(1-\bar{\theta}) = \$17$. Scenario A: miners at the margin (efficiency $E \sim U[150,350]$, elastic supply); Scenario B: miners locked in ($E \sim U[50,80]$, inelastic at $\delta = 0$).

![Figure 3](figures/sim3_delta.png)

Result: in Scenario A, $\Pi(\delta)$ is strictly decreasing with $\delta^* = 0$ (corner solution); in Scenario B, $\Pi(\delta)$ rises then falls with $\delta^* \approx 0.895$ (interior solution). **Proposition 5's necessary and sufficient condition holds exactly in the numerics**: with Phase-1 cold start (miners freely entering/exiting, high elasticity), $\delta = 0$ is optimal; $\delta > 0$ should only be considered after ecosystem lock-in.

## 8. Limitations and Future Work

1. **Unverifiable energy input**: the protocol cannot directly observe $E_j$; it can only constrain it indirectly via $Q_j$ and market behavior. This is the fundamental reason for choosing to "reward knowledge, not electricity consumption" — and this paper's most honest boundary.
2. **Endogenous query demand**: $q_j$ depends on the genuine utility of knowledge; $\hat{q}$ can only be conservatively estimated in the cold-start phase. The MVP's `q_count` instrumentation exists precisely for calibration.
3. **Regional verification**: $\delta > 0$ requires trusted geolocation proofs (decentralized oracles / hardware attestation), currently unsolved; hence Phase 1 keeps $\delta = 0$.
4. **Decentralizing review**: currently relies on allowlisted reviewers; Phase 3 requires a collusion-resistant decentralized review mechanism.
5. **The full optimal-control path**: Proposition 7(iii)'s cold-start optimal fee path $f_t^*$ gives only a directional result ($f < \bar{v}/2$, then return); the complete optimal-control solution (with $K_t$ state constraints and endogenized $d$) is left to a future version.
6. **Energy ≠ value (the Georgescu-Roegen warning, 1971)**: the kWh is a stable unit of account but does not explain prices. This mechanism anchors *production cost*, not *value*, with energy — the query fee $f$ is still set by the market. Confusing the two is a recurring error in the intellectual history of energy money; this paper explicitly does not commit it.
7. **The cost boundary of usefulness verification (Ball et al., "Proofs of Useless Work", 2020)**: in many settings, "waste-free mining" cannot satisfy security and usefulness simultaneously. This mechanism's answer is structural: **verify no energy consumption — verify only knowledge quality and query authenticity** (staking + review + query fees), shifting verification costs to the domain where AI excels. This is a premise on which the design stands; should cheap, trusted energy-consumption proofs emerge in the future, it can be revisited.

---

## 9. Conclusion

This paper turns one sentence into a computable mechanism: **electricity is real money, the electricity-price spread is real profit, knowledge is the crystallization of electricity, and queries are the monetization of knowledge**. Five formulas answer respectively: who produces (the entry condition), at what quality (the convex reward), how the system avoids losing money (the calibration iron law), what to do when the token price swings (the difficulty adjustment), and who captures the regional spread (the regional capture coefficient). This mechanism needs to know neither where miners are nor verify every kilowatt-hour; it need only verify the quality of knowledge and the authenticity of queries — the two things AI itself is best at verifying.

---

## References

*Entries marked † are sourced from the 2026-09-25 web-wide literature sweep (`LITERATURE_SWEEP.md`) and must be re-verified against the originals before journal submission; classic works (Ricardo, Marx, Georgescu-Roegen, Szabo) need no verification.*

- Ball, M., Rosen, A., Sabin, M., & Vasudevan, P. N. (2017). Proofs of useful work. *IACR Cryptology ePrint Archive*. †
- Ball, M., Rosen, A., Sabin, M., & Vasudevan, P. N. (2020). Proofs of useless work. †
- Cambridge Centre for Alternative Finance. (2025). Bitcoin mining cost and electricity survey. †
- DeKo. (2011). DeKo currency proposal (1 DeKo ≈ 10 kWh delivered electricity). †
- Edwards, C. / Capriole Investments. (2019). Bitcoin energy value formula. †
- Ford, H. (1921). Energy currency interview ("an hour of energy = $1"). †
- Georgescu-Roegen, N. (1971). *The Entropy Law and the Economic Process*. Harvard University Press.
- Hayes, A. (2015). A cost of production model for bitcoin; (2019) follow-up estimates. †
- JPMorgan. (2026). Bitcoin production-cost "soft floor" estimate (~$85,000). †
- Kristoufek, L. (2020). Bitcoin and mining-cost causality (price→cost). †
- Marx, K. (1885). *Das Kapital*, Vol. 2 ("moral depreciation" of fixed capital).
- Murialdo, F., & Belof, J. (2022). E-Stablecoin: 1 kWh mint/burn, geographic mint-burn arbitrage. *Cryptoeconomic Systems*, Lawrence Livermore National Laboratory. †
- OriginTrail. (2023). OT-RFC-20: "knowledge mining". †
- OriginTrail. (2026). OT-RFC-27: TRAC-metered query settlement. †
- Prat, J., & Walter, B. (2019). An equilibrium model of the market for bitcoin mining. †
- Ricardo, D. (1817). *On the Principles of Political Economy and Taxation*, Ch. 2–3 (differential rent).
- Shibata, N. (2019). Proof-of-search (client-paid solution market). †
- Szabo, N. (2002). Unforgeable costliness (essay).
- Technocracy Inc. (1932–1933). Energy certificates proposal. †
- Vana. (2024). Whitepaper: user-owned data network; per-inference burn, 30% to data contributors. †
- de Valk, J. (2026-04-24). "The 'fertile land' of our era is cheap electricity… This is Ricardo, in 2026, in datacentres." (public post) †
- Sang et al. (2022). RDF model of miner migration decisions (price spread → migration → profit spread). †
- Texas ERCOT bitcoin-miner empirical study. (2026). (`profit = hashprice × hashrate − electricity price × power draw`) †
- Bittensor; Allora Network. (whitepapers / docs: AI output-for-token; pay-per-query fee split). †

---

*Version history: v0.1 (2026-09-25) — skeleton and model core; v0.2 (2026-09-25) — literature review added (six-track precursor mapping + novelty-gap confirmation), naming note, adversarial lineage moved into the limitations section; v0.3 (2026-09-25) — original advances: Proposition 3 geometric-convergence proof hardened (with the step-size iron law $\alpha<1/L$), new Proposition 5 (necessary and sufficient condition for the optimal regional capture coefficient $\delta^*$ + proof that $\delta=0$ is optimal in Phase 1), new Proposition 6 (first-order condition for the optimal depreciation rate; sketch); v0.4 (2026-09-25) — numerical-simulation trio (geographic sorting / convergence vs oscillation / $\delta^*$ corner vs interior solutions, Figures 1–3), full welfare analysis for Proposition 6 (closed-form creator rent + overlapping-cohort optimality condition), lag remark for Proposition 3; v0.5 (2026-09-25) — new Proposition 7 (optimal query fee: static inverse-hazard-rate pricing, steady-state dynamic optimum coinciding with the static one, cold-start $f<\bar{v}/2$ corollary); identification strategy for $f$ established; v1.0 (2026-09-25) — full-draft polish: notation table (§3.0), notation unification (Proposition 7 value cap $V \to \bar{v}$, Formula 3 $\bar{\theta}_j \to \bar{\theta}$), reference list (with † pending-verification marks), limitation item 5 updated to the open optimal-control problem, abstract "four formulas" → "five formulas". v1.0 translation-proofreading errata (2026-09-25): Proposition 7 leftover $V\to\bar{v}$ fixed; §9 "four formulas" → "five formulas" (regional-capture item added).*
