import { useQuery } from '@tanstack/react-query'
import { FileText, CheckCircle, Clock, AlertCircle } from 'lucide-react'
import { resultsAPI } from '../services/api'

export default function Results() {
  const { data, isLoading } = useQuery({
    queryKey: ['my-results'],
    queryFn: () => resultsAPI.getAll(),
  })

  const results = data?.data?.results || []

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="page-header">
        <h1 className="page-title flex items-center gap-2">
          <FileText className="w-8 h-8 text-eco-400" />
          My Results
        </h1>
        <p className="page-subtitle">Track your performance across quizzes and assignments</p>
      </div>

      <div className="glass-card overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center p-12">
            <div className="w-8 h-8 rounded-full border-4 border-eco-500 border-t-transparent animate-spin"></div>
          </div>
        ) : results.length === 0 ? (
          <div className="text-center p-12 text-gray-400">
            No results found. Complete a quiz or assignment first!
          </div>
        ) : (
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="bg-slate-800/50 text-xs uppercase text-gray-400 border-b border-slate-700/50">
              <tr>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Score</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {results.map((r, i) => (
                <tr key={r.id || i} className="hover:bg-slate-800/20">
                  <td className="px-6 py-4 font-medium text-white capitalize">{r.type}</td>
                  <td className="px-6 py-4">
                    <span className="font-bold text-eco-400">{r.score}%</span>
                  </td>
                  <td className="px-6 py-4">
                    {r.status === 'completed' || r.status === 'checked' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-eco-500/10 text-eco-400 border border-eco-500/20 text-xs font-bold">
                        <CheckCircle className="w-3.5 h-3.5" /> Checked
                      </span>
                    ) : r.status === 'pending' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 text-xs font-bold">
                        <Clock className="w-3.5 h-3.5" /> Pending
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-gray-500/10 text-gray-400 border border-gray-500/20 text-xs font-bold">
                        <AlertCircle className="w-3.5 h-3.5" /> {r.status}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-gray-400">
                    {new Date(r.date).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
