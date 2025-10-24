
import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { RouterLink } from '@angular/router';
import { OnboardingSteps } from '../../shared/components/stepper/stepper';
import { KycService } from '../../shared/services/kyc.service';

@Component({
  standalone: true,
  selector: 'app-kyc-status',
  imports: [MatCardModule, MatChipsModule, RouterLink, OnboardingSteps],
  templateUrl: './kyc-status.html',
  styleUrl: './kyc-status.scss'
})
export class KycStatus {
  constructor(public kyc: KycService) {}
  status(){ return this.kyc.getSubmission()?.status ?? 'In-review'; }
}
