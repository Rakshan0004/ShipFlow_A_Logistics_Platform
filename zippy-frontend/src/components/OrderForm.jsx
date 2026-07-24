import React, { useState } from 'react';

const SAMPLE_NAMES = [
  'Rahul Sharma', 'Priya Verma', 'Ananya Iyer', 'Vikram Malhotra',
  'Sneha Patel', 'Karan Mehta', 'Rohan Gupta', 'Deepika Roy', 'Amitabh Das'
];

const PICKUP_LOCATIONS = [
  { city: 'Bengaluru', state: 'Karnataka', pincode: '560001', addr: '15 MG Road' },
  { city: 'Mumbai', state: 'Maharashtra', pincode: '400001', addr: '45 Nariman Point' },
  { city: 'Hyderabad', state: 'Telangana', pincode: '500001', addr: '12 Jubilee Hills' },
  { city: 'Pune', state: 'Maharashtra', pincode: '411001', addr: '88 FC Road' }
];

const DELIVERY_LOCATIONS = [
  { city: 'New Delhi', state: 'Delhi', pincode: '110001', addr: '22 Connaught Place' },
  { city: 'Chennai', state: 'Tamil Nadu', pincode: '600001', addr: '88 Anna Salai' },
  { city: 'Kolkata', state: 'West Bengal', pincode: '700001', addr: '10 Park Street' },
  { city: 'Ahmedabad', state: 'Gujarat', pincode: '380001', addr: '34 CG Road' }
];

export default function OrderForm({ onOrderCreated, loading }) {
  const [formData, setFormData] = useState({
    merchantOrderId: '',
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    pickupAddressLine1: '',
    pickupCity: '',
    pickupState: '',
    pickupPincode: '',
    deliveryAddressLine1: '',
    deliveryCity: '',
    deliveryState: '',
    deliveryPincode: '',
    weightGrams: '',
    lengthCm: '',
    widthCm: '',
    heightCm: '',
    paymentType: 'COD',
    codAmount: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'weightGrams' || name === 'lengthCm' || name === 'widthCm' || name === 'heightCm' || name === 'codAmount'
        ? (value === '' ? '' : Number(value))
        : value
    }));
  };

  const handleFillSample = () => {
    const randomName = SAMPLE_NAMES[Math.floor(Math.random() * SAMPLE_NAMES.length)];
    const randomPhone = '98' + Math.floor(10000000 + Math.random() * 90000000);
    const randomEmail = randomName.toLowerCase().replace(' ', '.') + Math.floor(10 + Math.random() * 90) + '@example.com';
    
    const pickup = PICKUP_LOCATIONS[Math.floor(Math.random() * PICKUP_LOCATIONS.length)];
    const delivery = DELIVERY_LOCATIONS[Math.floor(Math.random() * DELIVERY_LOCATIONS.length)];

    const randomWeight = (Math.floor(5 + Math.random() * 30) * 100); // 500g to 3500g
    const randomCod = (Math.floor(5 + Math.random() * 45) * 100); // ₹500 to ₹5000

    setFormData({
      merchantOrderId: 'MERCHANT-' + Math.floor(10000 + Math.random() * 90000),
      customerName: randomName,
      customerPhone: randomPhone,
      customerEmail: randomEmail,
      pickupAddressLine1: pickup.addr,
      pickupCity: pickup.city,
      pickupState: pickup.state,
      pickupPincode: pickup.pincode,
      deliveryAddressLine1: delivery.addr,
      deliveryCity: delivery.city,
      deliveryState: delivery.state,
      deliveryPincode: delivery.pincode,
      weightGrams: randomWeight,
      lengthCm: 20,
      widthCm: 15,
      heightCm: 10,
      paymentType: 'COD',
      codAmount: randomCod
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      merchantOrderId: formData.merchantOrderId,
      customer: {
        name: formData.customerName,
        phone: formData.customerPhone,
        email: formData.customerEmail
      },
      pickupAddress: {
        addressLine1: formData.pickupAddressLine1,
        city: formData.pickupCity,
        state: formData.pickupState,
        pincode: formData.pickupPincode
      },
      deliveryAddress: {
        addressLine1: formData.deliveryAddressLine1,
        city: formData.deliveryCity,
        state: formData.deliveryState,
        pincode: formData.deliveryPincode
      },
      package: {
        weightGrams: Number(formData.weightGrams),
        lengthCm: Number(formData.lengthCm || 10),
        widthCm: Number(formData.widthCm || 10),
        heightCm: Number(formData.heightCm || 10)
      },
      paymentType: formData.paymentType,
      codAmount: formData.paymentType === 'COD' ? Number(formData.codAmount) : null
    };

    onOrderCreated(payload);
  };

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <h2 className="card-title">📦 Create New Order</h2>
        <button type="button" className="btn-secondary" onClick={handleFillSample}>
          ⚡ Auto-Fill Sample Data (Randomized)
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="form-group">
            <label>Merchant Order ID</label>
            <input
              type="text"
              name="merchantOrderId"
              className="form-control"
              value={formData.merchantOrderId}
              onChange={handleChange}
              placeholder="e.g. MERCHANT-10001"
              required
            />
          </div>

          <div className="form-group">
            <label>Customer Name</label>
            <input
              type="text"
              name="customerName"
              className="form-control"
              value={formData.customerName}
              onChange={handleChange}
              placeholder="e.g. Rahul Sharma"
              required
            />
          </div>

          <div className="form-group">
            <label>Customer Phone</label>
            <input
              type="text"
              name="customerPhone"
              className="form-control"
              value={formData.customerPhone}
              onChange={handleChange}
              placeholder="e.g. 9876543210"
              required
            />
          </div>

          <div className="form-group">
            <label>Customer Email</label>
            <input
              type="email"
              name="customerEmail"
              className="form-control"
              value={formData.customerEmail}
              onChange={handleChange}
              placeholder="e.g. rahul@example.com"
            />
          </div>

          <div className="form-group">
            <label>Pickup Pincode (6 digits)</label>
            <input
              type="text"
              name="pickupPincode"
              className="form-control"
              value={formData.pickupPincode}
              onChange={handleChange}
              placeholder="e.g. 560001"
              required
            />
          </div>

          <div className="form-group">
            <label>Delivery Pincode (6 digits)</label>
            <input
              type="text"
              name="deliveryPincode"
              className="form-control"
              value={formData.deliveryPincode}
              onChange={handleChange}
              placeholder="e.g. 110001"
              required
            />
          </div>

          <div className="form-group">
            <label>Package Weight (Grams)</label>
            <input
              type="number"
              name="weightGrams"
              className="form-control"
              value={formData.weightGrams}
              onChange={handleChange}
              placeholder="e.g. 1500"
              min="1"
              required
            />
          </div>

          <div className="form-group">
            <label>Payment Type</label>
            <select
              name="paymentType"
              className="form-control"
              value={formData.paymentType}
              onChange={handleChange}
            >
              <option value="COD">Cash on Delivery (COD)</option>
              <option value="PREPAID">Prepaid</option>
            </select>
          </div>

          {formData.paymentType === 'COD' && (
            <div className="form-group">
              <label>COD Amount (₹)</label>
              <input
                type="number"
                name="codAmount"
                className="form-control"
                value={formData.codAmount}
                onChange={handleChange}
                placeholder="e.g. 2500"
                min="1"
                required
              />
            </div>
          )}
        </div>

        <div style={{ marginTop: '1.75rem', textAlign: 'right' }}>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Creating Order...' : 'Create Order & Compare Rates →'}
          </button>
        </div>
      </form>
    </div>
  );
}
