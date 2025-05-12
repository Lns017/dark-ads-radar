
import React, { useState } from 'react';
import { Calendar, ChevronDown } from 'lucide-react';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';

export function DateRangePicker() {
  const [date, setDate] = useState<{
    from: Date;
    to?: Date;
  }>({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date(),
  });

  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (selectedDate: any) => {
    setDate(selectedDate);
    if (selectedDate.to) {
      setIsOpen(false);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-[240px] justify-start text-left font-normal bg-muted/30 border-border hover:bg-muted/40",
            !date && "text-muted-foreground"
          )}
        >
          <Calendar className="mr-2 h-4 w-4" />
          {date?.from ? (
            date.to ? (
              <>
                {format(date.from, "dd/MM/yyyy", { locale: ptBR })} -{" "}
                {format(date.to, "dd/MM/yyyy", { locale: ptBR })}
              </>
            ) : (
              format(date.from, "dd/MM/yyyy", { locale: ptBR })
            )
          ) : (
            <span>Selecione um período</span>
          )}
          <ChevronDown className="ml-auto h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <CalendarComponent
          initialFocus
          mode="range"
          defaultMonth={date?.from}
          selected={date}
          onSelect={handleSelect}
          numberOfMonths={2}
          locale={ptBR}
        />
        <div className="flex justify-end gap-2 p-3 border-t border-border">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const today = new Date();
              setDate({
                from: new Date(today.setDate(today.getDate() - 7)),
                to: new Date(),
              });
              setIsOpen(false);
            }}
          >
            Últimos 7 dias
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const today = new Date();
              setDate({
                from: new Date(today.setDate(today.getDate() - 30)),
                to: new Date(),
              });
              setIsOpen(false);
            }}
          >
            Últimos 30 dias
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
