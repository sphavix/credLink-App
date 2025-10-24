import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { OnboardingSteps } from '../../shared/components/stepper/stepper';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerToggle } from '@angular/material/datepicker';
import { MatSelectModule } from '@angular/material/select';

@Component({
  standalone: true,
  selector: 'app-onboarding-personal',
  imports: [CommonModule, ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, OnboardingSteps, MatDatepickerModule, MatNativeDateModule, MatIconModule, MatSelectModule],
  templateUrl: './onboarding-personal.html',
  styleUrls: ['./onboarding-personal.scss']
})
export class OnboardingPersonal implements OnInit {
  constructor(private fb: FormBuilder, private router: Router){}
  form!: FormGroup;

  // provinces for South Africa
  provinces = [
    'Eastern Cape',
    'Free State',
    'Gauteng',
    'KwaZulu-Natal',
    'Limpopo',
    'Mpumalanga',
    'North West',
    'Northern Cape',
    'Western Cape'
  ];

  ngOnInit(): void {
    this.form = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      middleName: [''],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required]],
      dateOfBirth: [null, [Validators.required]],
      nationalIdOrPassport: ['', [Validators.required, Validators.minLength(6)]],
      idExpiry: [null, []],
      street: ['', [Validators.required]],
      city: ['', [Validators.required]],
      province: ['', [Validators.required]],
      postalCode: ['', [Validators.required]],
      country: ['South Africa', [Validators.required]]
    });
  }
  submit(){ if (this.form.invalid) { this.form.markAllAsTouched(); return; } localStorage.setItem('credlink-profile', JSON.stringify(this.form.value)); this.router.navigateByUrl('/onboarding/kyc'); }
}
