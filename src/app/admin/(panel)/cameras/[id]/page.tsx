'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import CameraEditorForm from '@/components/admin/CameraEditorForm';
import { safeJson } from '@/lib/fetch-json';
import type { Camera } from '@/types';
import Cookies from 'js-cookie';

export default function EditCameraPage() {
  const { id } = useParams<{ id: string }>();
  const [camera, setCamera] = useState<Camera | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = Cookies.get('vyom_token');
    fetch(`/api/cameras/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(async r => {
        const data = await safeJson<any>(r);
        if (!r.ok) throw new Error(data?.error || 'Not found');
        return data;
      })
      .then(d => { setCamera(d); setLoading(false); })
      .catch(e => { setError(String(e.message || e)); setLoading(false); });
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto space-y-4">
        {Array(5).fill(0).map((_, i) => <div key={i} className="h-12 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />)}
      </div>
    );
  }
  if (error || !camera) return <div className="text-center py-16 text-gray-400"><p>Camera not found.</p></div>;
  return <CameraEditorForm camera={camera} />;
}
