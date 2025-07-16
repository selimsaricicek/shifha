import React from 'react';
import { Pill, Calendar } from 'lucide-react';
import Card from '../components/Card';
import { medicationData, appointmentData } from '../data/mockData';

const TrackingScreen = () => {
    return (
        <div className="space-y-6">
            <Card>
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                    <Pill className="mr-2 text-cyan-600"/>
                    İlaç Takibi
                </h3>
                <ul className="space-y-3">
                    {medicationData.map(med => (
                        <li key={med.id} className="flex items-center justify-between p-4 rounded-xl bg-white shadow-sm">
                            <div>
                                <p className="font-bold text-gray-800">{med.name}</p>
                                <p className="text-sm">{med.dosage} - {med.time}</p>
                            </div>
                        </li>
                    ))}
                </ul>
            </Card>
            <Card>
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                    <Calendar className="mr-2 text-cyan-600"/>
                    Yaklaşan Randevular
                </h3>
                <ul className="space-y-3">
                    {appointmentData.map(app => (
                        <li key={app.id} className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm">
                            <div>
                                <p className="font-bold text-gray-800">{app.doctor}</p>
                                <p className="text-sm text-gray-600">{app.specialty}</p>
                            </div>
                            <div className="text-right">
                                <p className="font-semibold text-cyan-700">{app.date}</p>
                                <p className="text-sm text-gray-500">{app.time}</p>
                            </div>
                        </li>
                    ))}
                </ul>
            </Card>
        </div>
    );
};

export default TrackingScreen; 