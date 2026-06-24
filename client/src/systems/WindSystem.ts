export type WindDirection = "left" | "right" | "none";

export interface WindState {
  direction: WindDirection;
  strength: number;
  level: number;
  label: string;
}

export class WindSystem {
  private totalHits = 0;
  private state: WindState = {
    direction: "none",
    strength: 0,
    level: 0,
    label: "No Wind",
  };

  getState(): WindState {
    return this.state;
  }

  increaseDifficulty(): WindState {
    this.totalHits += 1;

    const level = Math.min(this.totalHits, 5);
    const direction: WindDirection = Math.random() > 0.5 ? "right" : "left";

    const strengthByLevel: Record<number, number> = {
      1: 35,
      2: 65,
      3: 95,
      4: 130,
      5: 165,
    };

    const labelByLevel: Record<number, string> = {
      1: "Light Wind",
      2: "Medium Wind",
      3: "Strong Wind",
      4: "Very Strong Wind",
      5: "Unstable Wind",
    };

    this.state = {
      direction,
      strength: strengthByLevel[level],
      level,
      label: labelByLevel[level],
    };

    return this.state;
  }

  getForceX(): number {
    if (this.state.direction === "left") {
      return -this.state.strength;
    }

    if (this.state.direction === "right") {
      return this.state.strength;
    }

    return 0;
  }

  getDisplayText(): string {
    if (this.state.direction === "none") {
      return "Wind: No Wind";
    }

    const arrow = this.state.direction === "right" ? "→" : "←";

    return `Wind: ${arrow} ${this.state.label} (${this.state.strength})`;
  }
}
