
import { Component, input } from '@angular/core';
import { MatChipsModule } from '@angular/material/chips';

@Component({
  selector: 'app-onboarding-steps',
  standalone: true,
  imports: [MatChipsModule],
  templateUrl: './stepper.html',
  styleUrl: './stepper.scss'
})
export class OnboardingSteps {
  current = input.required<number>();
  items = ['Personal information','KYC Upload','KYC Submit','KYC Status'];
}
