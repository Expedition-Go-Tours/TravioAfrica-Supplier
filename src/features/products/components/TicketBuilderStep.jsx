import { Plus, Trash2, Ticket } from "lucide-react";
import { useProductBuilderStore } from "@/features/products/stores/productBuilderStore";

const TICKET_TYPES = [
  { value: "paper", label: "Paper Ticket" },
  { value: "mobile", label: "Mobile Ticket" },
  { value: "e-ticket", label: "E-Ticket" },
];

export default function TicketBuilderStep() {
  const { product, updateNested } = useProductBuilderStore();
  const ticketTypes = product.bookingRules.ticketTypes || [];

  const addTicketType = () => {
    const updated = [...ticketTypes, { type: "e-ticket", name: "", description: "" }];
    updateNested("bookingRules.ticketTypes", updated);
  };

  const updateTicket = (index, field, value) => {
    const updated = [...ticketTypes];
    updated[index] = { ...updated[index], [field]: value };
    updateNested("bookingRules.ticketTypes", updated);
  };

  const removeTicket = (index) => {
    const updated = ticketTypes.filter((_, i) => i !== index);
    updateNested("bookingRules.ticketTypes", updated);
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-slate-500">
        Define the ticket types available for this experience and how they are delivered.
      </p>

      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-800">
          <span className="flex items-center gap-2">
            <Ticket size={16} className="text-slate-500" />
            Ticket Types
          </span>
        </h3>
        <button
          onClick={addTicketType}
          className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors"
        >
          <Plus size={12} />
          Add Ticket Type
        </button>
      </div>

      <div className="space-y-4">
        {ticketTypes.length === 0 && (
          <div className="p-6 bg-slate-50 border border-dashed border-slate-300 rounded-xl text-center">
            <Ticket size={24} className="mx-auto text-slate-400 mb-2" />
            <p className="text-sm text-slate-500">No ticket types defined</p>
            <p className="text-xs text-slate-400 mt-1">Click "Add Ticket Type" to define how tickets are delivered</p>
          </div>
        )}
        {ticketTypes.map((ticket, index) => (
          <div key={index} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Ticket #{index + 1}
              </span>
              <button
                onClick={() => removeTicket(index)}
                className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
              >
                <Trash2 size={14} />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-500 mb-1">Ticket Name</label>
                <input
                  type="text"
                  value={ticket.name}
                  onChange={(e) => updateTicket(index, "name", e.target.value)}
                  placeholder="e.g., Standard Entry"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Delivery Method</label>
                <select
                  value={ticket.type}
                  onChange={(e) => updateTicket(index, "type", e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none bg-white"
                >
                  {TICKET_TYPES.map((tt) => (
                    <option key={tt.value} value={tt.value}>{tt.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Description</label>
              <textarea
                value={ticket.description}
                onChange={(e) => updateTicket(index, "description", e.target.value)}
                rows={2}
                placeholder="Describe what this ticket includes..."
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none resize-none"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
