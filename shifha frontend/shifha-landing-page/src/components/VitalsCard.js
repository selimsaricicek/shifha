import React from 'react';
import { HeartPulse, Activity, Thermometer, BarChart, Percent } from 'lucide-react';

const VitalsCard = ({ vitals }) => {
    if (!vitals) return null;

    const getVitalClass = (type, value) => {
        if (type === 'spo2' && value < 94) return 'text-red-500';
        if (type === 'pulse' && (value > 100 || value < 60)) return 'text-orange-500';
        if (type === 'rr' && (value > 20 || value < 12)) return 'text-orange-500';
        if (type === 'temp' && (value > 38.0 || value < 36.0)) return 'text-red-500';
        if (type === 'bp') {
            const [systolic, diastolic] = value.split('/').map(Number);
            if (systolic > 140 || systolic < 90 || diastolic > 90 || diastolic < 60) {
                return 'text-red-500';
            }
        }
        return 'text-gray-900';
    };
    
    const VitalDisplay = ({ icon, label, value, unit, type }) => (
        <div className="bg-gray-50 p-4 rounded-lg flex flex-col items-center justify-center border border-gray-200">
            <div className="flex items-center text-gray-500">
                {icon}
                <p className="text-sm font-medium ml-2">{label}</p>
            </div>
            <p className={`text-3xl font-bold mt-1 ${getVitalClass(type, value)}`}>{value}</p>
            <p className="text-xs text-gray-400">{unit}</p>
        </div>
    );

    return (
        <div>
            <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center">
                <HeartPulse size={20} className="mr-2 text-blue-600" />
                Vital Bulgular
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <VitalDisplay 
                    icon={<Activity size={16} className="text-gray-500" />} 
                    label="Kan Basıncı" 
                    value={vitals.bp} 
                    unit="mmHg" 
                    type="bp" 
                />
                <VitalDisplay 
                    icon={<HeartPulse size={16} className="text-gray-500" />} 
                    label="Nabız" 
                    value={vitals.pulse} 
                    unit="bpm" 
                    type="pulse" 
                />
                <VitalDisplay 
                    icon={<Thermometer size={16} className="text-gray-500" />} 
                    label="Ateş" 
                    value={vitals.temp} 
                    unit="°C" 
                    type="temp" 
                />
                <VitalDisplay 
                    icon={<BarChart size={16} className="text-gray-500" />} 
                    label="Solunum" 
                    value={vitals.rr} 
                    unit="/dk" 
                    type="rr" 
                />
                <VitalDisplay 
                    icon={<Percent size={16} className="text-gray-500" />} 
                    label="SpO2" 
                    value={vitals.spo2} 
                    unit="%" 
                    type="spo2" 
                />
            </div>
        </div>
    );
};

export default VitalsCard; 