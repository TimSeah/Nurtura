// Core CareRecipient Entity - Domain Model
// Follows Single Responsibility Principle - only handles care recipient data and behavior

export interface CareRecipientProperties {
  id: string;
  name: string;
  dateOfBirth: Date;
  relationship: string;
  medicalConditions: string[];
  medications: Medication[];
  emergencyContacts: EmergencyContact[];
  caregiverNotes: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  instructions: string;
  startDate: Date;
  endDate?: Date;
  isActive: boolean;
}

export interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  email?: string;
  isPrimary: boolean;
}

export class CareRecipient {
  private constructor(private props: CareRecipientProperties) {}

  static create(props: Omit<CareRecipientProperties, 'id' | 'createdAt' | 'updatedAt'>): CareRecipient {
    const now = new Date();
    return new CareRecipient({
      ...props,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now
    });
  }

  static fromPersistence(props: CareRecipientProperties): CareRecipient {
    return new CareRecipient(props);
  }

  get id(): string {
    return this.props.id;
  }

  get name(): string {
    return this.props.name;
  }

  get dateOfBirth(): Date {
    return this.props.dateOfBirth;
  }

  get age(): number {
    const today = new Date();
    const birthDate = new Date(this.props.dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }

  get relationship(): string {
    return this.props.relationship;
  }

  get medicalConditions(): string[] {
    return [...this.props.medicalConditions];
  }

  get medications(): Medication[] {
    return [...this.props.medications];
  }

  get emergencyContacts(): EmergencyContact[] {
    return [...this.props.emergencyContacts];
  }

  get caregiverNotes(): string {
    return this.props.caregiverNotes;
  }

  get isActive(): boolean {
    return this.props.isActive;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  updateProfile(updates: {
    name?: string;
    relationship?: string;
    caregiverNotes?: string;
  }): void {
    Object.assign(this.props, updates);
    this.props.updatedAt = new Date();
  }

  addMedicalCondition(condition: string): void {
    if (!this.props.medicalConditions.includes(condition)) {
      this.props.medicalConditions.push(condition);
      this.props.updatedAt = new Date();
    }
  }

  removeMedicalCondition(condition: string): void {
    const index = this.props.medicalConditions.indexOf(condition);
    if (index > -1) {
      this.props.medicalConditions.splice(index, 1);
      this.props.updatedAt = new Date();
    }
  }

  addMedication(medication: Omit<Medication, 'id'>): void {
    const newMedication: Medication = {
      ...medication,
      id: crypto.randomUUID()
    };
    this.props.medications.push(newMedication);
    this.props.updatedAt = new Date();
  }

  updateMedication(medicationId: string, updates: Partial<Omit<Medication, 'id'>>): void {
    const medication = this.props.medications.find(m => m.id === medicationId);
    if (medication) {
      Object.assign(medication, updates);
      this.props.updatedAt = new Date();
    }
  }

  removeMedication(medicationId: string): void {
    const index = this.props.medications.findIndex(m => m.id === medicationId);
    if (index > -1) {
      this.props.medications.splice(index, 1);
      this.props.updatedAt = new Date();
    }
  }

  addEmergencyContact(contact: Omit<EmergencyContact, 'id'>): void {
    const newContact: EmergencyContact = {
      ...contact,
      id: crypto.randomUUID()
    };
    this.props.emergencyContacts.push(newContact);
    this.props.updatedAt = new Date();
  }

  updateEmergencyContact(contactId: string, updates: Partial<Omit<EmergencyContact, 'id'>>): void {
    const contact = this.props.emergencyContacts.find(c => c.id === contactId);
    if (contact) {
      Object.assign(contact, updates);
      this.props.updatedAt = new Date();
    }
  }

  removeEmergencyContact(contactId: string): void {
    const index = this.props.emergencyContacts.findIndex(c => c.id === contactId);
    if (index > -1) {
      this.props.emergencyContacts.splice(index, 1);
      this.props.updatedAt = new Date();
    }
  }

  deactivate(): void {
    this.props.isActive = false;
    this.props.updatedAt = new Date();
  }

  activate(): void {
    this.props.isActive = true;
    this.props.updatedAt = new Date();
  }

  toJSON(): CareRecipientProperties {
    return { ...this.props };
  }
}
