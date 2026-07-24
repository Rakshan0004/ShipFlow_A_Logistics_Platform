import React, { useState } from 'react';
import Card from '../../ui/Card/Card';
import Button from '../../ui/Button/Button';
import Input from '../../ui/Input/Input';
import Select from '../../ui/Select/Select';

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
    lengthCm: '20',
    widthCm: '15',
    heightCm: '10',
    paymentType: 'COD',
    codAmount: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFillSample = () => {
    const randomName = SAMPLE_NAMES[Math.floor(Math.random() * SAMPLE_NAMES.length)];
    const randomPhone = '98' + Math.floor(10000000 + Math.random() * 90000000);
    const randomEmail = randomName.toLowerCase().replace(' ', '.') + Math.floor(10 + Math.random() * 90) + '@example.com';
    
    const pickup = PICKUP_LOCATIONS[Math.floor(Math.random() * PICKUP_LOCATIONS.length)];
    const delivery = DELIVERY_LOCATIONS[Math.floor(Math.random() * DELIVERY_LOCATIONS.length)];

    const randomWeight = Math.floor(5 + Math.random() * 30) * 100;
    const randomCod = Math.floor(5 + Math.random() * 45) * 100;

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
      weightGrams: String(randomWeight),
      lengthCm: '20',
      widthCm: '15',
      heightCm: '10',
      paymentType: 'COD',
      codAmount: String(randomCod)
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
        addressLine1: formData.pickupAddressLine1 || 'Pickup Point A',
        city: formData.pickupCity || 'Bengaluru',
        state: formData.pickupState || 'Karnataka',
        pincode: formData.pickupPincode
      },
      deliveryAddress: {
        addressLine1: formData.deliveryAddressLine1 || 'Delivery Point B',
        city: formData.deliveryCity || 'Delhi',
        state: formData.deliveryState || 'Delhi',
        pincode: formData.deliveryPincode
      },
      package: {
        weightGrams: Number(formData.weightGrams),
        lengthCm: Number(formData.lengthCm || 10),
        widthCm: Number(formData.widthCm || 10),
        heightCm: Number(formData.heightCm || 10)
      },
      paymentType: formData.paymentType,
      codAmount: formData.paymentType === 'COD' ? Number(formData.codAmount) : 0
    };

    onOrderCreated(payload);
  };

  return (
    <Card 
      title="📦 Create New Shipment Order" 
      headerExtra={
        <Button variant="secondary" size="sm" type="button" onClick={handleFillSample}>
          ⚡ Auto-Fill Sample Data
        </Button>
      }
    >
      <form onSubmit={handleSubmit}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.25rem',
          marginBottom: '1.5rem'
        }}>
          <Input
            label="Merchant Order ID"
            name="merchantOrderId"
            value={formData.merchantOrderId}
            onChange={handleChange}
            placeholder="e.g. MERCHANT-10001"
            required
          />

          <Input
            label="Customer Name"
            name="customerName"
            value={formData.customerName}
            onChange={handleChange}
            placeholder="e.g. Rahul Sharma"
            required
          />

          <Input
            label="Customer Phone"
            name="customerPhone"
            value={formData.customerPhone}
            onChange={handleChange}
            placeholder="e.g. 9876543210"
            required
          />

          <Input
            label="Customer Email"
            type="email"
            name="customerEmail"
            value={formData.customerEmail}
            onChange={handleChange}
            placeholder="e.g. rahul@example.com"
          />

          <Input
            label="Pickup Pincode (6 digits)"
            name="pickupPincode"
            value={formData.pickupPincode}
            onChange={handleChange}
            placeholder="e.g. 560001"
            required
          />

          <Input
            label="Delivery Pincode (6 digits)"
            name="deliveryPincode"
            value={formData.deliveryPincode}
            onChange={handleChange}
            placeholder="e.g. 110001"
            required
          />

          <Input
            label="Package Weight (Grams)"
            type="number"
            name="weightGrams"
            value={formData.weightGrams}
            onChange={handleChange}
            placeholder="e.g. 1500"
            required
          />

          <Select
            label="Payment Mode"
            name="paymentType"
            value={formData.paymentType}
            onChange={(val) => setFormData(prev => ({ ...prev, paymentType: val }))}
            options={[
              { value: 'COD', label: 'Cash on Delivery (COD)' },
              { value: 'PREPAID', label: 'Prepaid' }
            ]}
          />

          {formData.paymentType === 'COD' && (
            <Input
              label="COD Collectible Amount (₹)"
              type="number"
              name="codAmount"
              value={formData.codAmount}
              onChange={handleChange}
              placeholder="e.g. 2500"
              required
            />
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button variant="primary" type="submit" loading={loading}>
            Create Order & Compare Rates →
          </Button>
        </div>
      </form>
    </Card>
  );
}
