import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { User, Briefcase, Building2, Globe, Cpu, LineChart, MessageSquare, Award } from 'lucide-react';

const industryIcons = {
    'tech': Cpu,
    'finance': LineChart,
    'ecommerce': Globe,
    'logistics': Building2,
    'consulting': Briefcase,
    'media': MessageSquare,
    'default': User
};

const getNodeIcon = (industry = '') => {
    const ind = industry.toLowerCase();
    for (const [key, Icon] of Object.entries(industryIcons)) {
        if (ind.includes(key)) return Icon;
    }
    return industryIcons.default;
};

const PRIGNode = ({ data, selected }) => {
    const Icon = getNodeIcon(data.occupation?.industry);
    const isRoot = data.metadata?.isRoot || data.id === 'root';
    const leverageScore = data.leverageScore || 0;

    return (
        <div className={`px-4 py-3 rounded-xl border-2 transition-all duration-300 min-w-[200px] shadow-2xl backdrop-blur-md
      ${selected
                ? 'border-blue-500 bg-blue-900/40 ring-4 ring-blue-500/20'
                : isRoot
                    ? 'border-emerald-500/50 bg-emerald-900/20'
                    : 'border-gray-700 bg-gray-800/80 hover:border-gray-600'}`}>

            <Handle type="target" position={Position.Top} className="w-3 h-3 !bg-gray-600 border-2 border-gray-800" />

            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg 
          ${isRoot ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-700/50 text-gray-400'}`}>
                    <Icon size={20} />
                </div>

                <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-white truncate">{data.name || 'Unknown'}</div>
                    <div className="text-[10px] text-gray-400 truncate uppercase tracking-wider font-semibold italic">
                        {data.occupation?.role || 'No Role'}
                    </div>
                </div>

                {leverageScore > 0 && (
                    <div className="flex flex-col items-end">
                        <div className="text-[10px] text-gray-400 font-bold uppercase">ROI</div>
                        <div className={`text-xs font-black ${leverageScore > 70 ? 'text-emerald-400' : 'text-blue-400'}`}>
                            {leverageScore}
                        </div>
                    </div>
                )}
            </div>

            {data.occupation?.industry && (
                <div className="mt-2 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></span>
                    <span className="text-[10px] text-gray-300 font-medium uppercase tracking-tight">{data.occupation.industry}</span>
                </div>
            )}

            <Handle type="source" position={Position.Bottom} className="w-3 h-3 !bg-gray-600 border-2 border-gray-800" />
        </div>
    );
};

export default memo(PRIGNode);
