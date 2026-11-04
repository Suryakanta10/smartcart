export function validateCheckout(form) {
  const errors = {};

  if (form.fullName.trim().length < 2) {
    errors.fullName = "Enter your full name";
  }
  if (!/^[6-9]\d{9}$/.test(form.phone.trim())) {
    errors.phone = "Enter a valid 10-digit mobile number";
  }
  if (form.address.trim().length < 5) {
    errors.address = "Enter your full address";
  }
  if (form.city.trim().length < 2) {
    errors.city = "Enter your city";
  }
  if (!/^\d{6}$/.test(form.pincode.trim())) {
    errors.pincode = "Enter a valid 6-digit pincode";
  }

  return errors;
}
