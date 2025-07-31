// Core VitalSigns Entity - Domain Model
// Follows Single Responsibility Principle - only handles vital signs data and validation

export type VitalSignType = 
  | 'blood_pressure'
  | 'heart_rate'
  | 'temperature'
  | 'weight'
  | 'blood_sugar'
  | 'oxygen_saturation';

export interface VitalSignsProperties {
  id: string;
  recipientId: string;
  vitalType: VitalSignType;
  value: string;
  unit: string;
  recordedAt: Date;
  notes?: string;
  isAbnormal?: boolean;
  createdAt: Date;
}

export class VitalSigns {
  private constructor(private props: VitalSignsProperties) {}

  static create(props: Omit<VitalSignsProperties, 'id' | 'createdAt' | 'isAbnormal'>): VitalSigns {
    const vitalSigns = new VitalSigns({
      ...props,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      isAbnormal: false
    });
    
    vitalSigns.evaluateAbnormality();
    return vitalSigns;
  }

  static fromPersistence(props: VitalSignsProperties): VitalSigns {
    return new VitalSigns(props);
  }

  get id(): string {
    return this.props.id;
  }

  get recipientId(): string {
    return this.props.recipientId;
  }

  get vitalType(): VitalSignType {
    return this.props.vitalType;
  }

  get value(): string {
    return this.props.value;
  }

  get unit(): string {
    return this.props.unit;
  }

  get recordedAt(): Date {
    return this.props.recordedAt;
  }

  get notes(): string | undefined {
    return this.props.notes;
  }

  get isAbnormal(): boolean {
    return this.props.isAbnormal || false;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  private evaluateAbnormality(): void {
    this.props.isAbnormal = this.isValueAbnormal();
  }

  private isValueAbnormal(): boolean {
    const numericValue = this.parseNumericValue();
    
    switch (this.props.vitalType) {
      case 'heart_rate':
        return numericValue < 60 || numericValue > 100;
        
      case 'temperature':
        // Assuming Fahrenheit
        return numericValue < 97.0 || numericValue > 99.5;
        
      case 'weight':
        // Basic validation - significant changes would need historical context
        return false;
        
      case 'blood_sugar':
        return numericValue < 70 || numericValue > 140;
        
      case 'oxygen_saturation':
        return numericValue < 95;
        
      case 'blood_pressure':
        return this.isBloodPressureAbnormal();
        
      default:
        return false;
    }
  }

  private parseNumericValue(): number {
    // Extract first number from value string
    const match = this.props.value.match(/^\d+(\.\d+)?/);
    return match ? parseFloat(match[0]) : 0;
  }

  private isBloodPressureAbnormal(): boolean {
    // Parse systolic/diastolic from format like "120/80"
    const bpMatch = this.props.value.match(/^(\d+)\/(\d+)$/);
    if (!bpMatch) return false;
    
    const systolic = parseInt(bpMatch[1]);
    const diastolic = parseInt(bpMatch[2]);
    
    // High blood pressure thresholds
    return systolic >= 140 || diastolic >= 90 || systolic < 90 || diastolic < 60;
  }

  updateNotes(notes: string): void {
    this.props.notes = notes;
  }

  getDisplayValue(): string {
    return `${this.props.value} ${this.props.unit}`;
  }

  getFormattedType(): string {
    return this.props.vitalType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  toJSON(): VitalSignsProperties {
    return { ...this.props };
  }
}
