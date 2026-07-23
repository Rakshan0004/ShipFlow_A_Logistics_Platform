import React, { useState } from 'react';

export default function OrderForm({ onOrderCreated, loading }) {
  const [formData, setFormData] = useState({
    merchantOrderId: 'MERCHANT-' + Math.floor(10000 + Math.random() * 90000),
    customerName: 'Rahul Sharma',
    customerPhone: '9876543210',
    customerEmail: 'rahul@example.com',
    pickupAddressLine1: '15 MG Road',
    pickupCity: 'Bengaluru',
    pickupState: 'Karnataka',
    pickupPincode: '560001',
    deliveryAddressLine1: '22 Connaught Place',
    deliveryCity: 'New Delhi',
    deliveryState: 'Delhi',
    deliveryPincode: '110001',
    weightGrams: 1500,
    lengthCm: 20,
    widthCm: 15,
    heightCm: 10,
    paymentType: 'COD',
    codAmount: 2500.00
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
    setFormData({
      merchantOrderId: 'MERCHANT-' + Math.floor(10000 + Math.random() * 90000),
      customerName: 'Priya Verma',
      customerPhone: '9812345678',
      customerEmail: 'priya@example.com',
      pickupAddressLine1: '100 Feet Road, Indiranagar',
      pickupCity: 'Bengaluru',
      pickupState: 'Karnataka',
      pickupPincode: '560038',
      deliveryAddressLine1: 'Bandra West',
      deliveryCity: 'Mumbai',
      deliveryState: 'Maharashtra',
      deliveryPincode: '400050',
      weightGrams: 1200,
      lengthCm: 25,
      widthCm: 18,
      heightCm: 12,
      paymentType: 'COD',
      codAmount: 1850.00
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
        lengthCm: Number(formData.lengthCm),
        widthCm: Number(formData.widthCm),
        heightCm: Number(formData.heightCm)
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
          ⚡ Auto-Fill Sample Data
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
            />
          </div>

          <div className="form-group">
            <label>Pickup Pincode</label>
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
            <label>Delivery Pincode</label>
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
