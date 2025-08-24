"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import Quiz from "@/types/Quiz";
import Module from "@/types/module";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export type QuizFormData = { name: string; moduleId: string };

interface QuizFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "add" | "edit";
  quiz?: Quiz;
  modules: Module[];
  onSubmit: (data: QuizFormData) => void;
}

export default function QuizForm({ open, onOpenChange, mode, quiz, modules, onSubmit }: QuizFormProps) {
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<QuizFormData>({
    defaultValues: { name: "", moduleId: "" },
  });

  useEffect(() => {
    if (mode === "edit" && quiz) {
      reset({ name: quiz.name, moduleId: String(quiz.moduleId) });
    } else {
      reset({ name: "", moduleId: modules[0]?._id ? String(modules[0]._id) : "" });
    }
  }, [mode, quiz, reset, modules]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit((data) => onSubmit(data))} className="space-y-4">
          <DialogHeader>
            <DialogTitle>{mode === "add" ? "Créer un quiz" : "Modifier un quiz"}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Nom du quiz*</Label>
              <Input {...register("name", { required: "Nom requis" })} />
              {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}
            </div>
            <div>
              <Label>Module*</Label>
              <Select
                      onValueChange={(v) => setValue("moduleId", v)}
                      defaultValue={mode === 'edit' && quiz ? String(quiz.moduleId) : (modules[0]?._id ? String(modules[0]._id) : undefined)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Sélectionner un module" />
                </SelectTrigger>
                <SelectContent>
                  {modules.map((m) => (
                    <SelectItem key={String(m._id)} value={String(m._id)}>{m.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.moduleId && <p className="text-red-500 text-xs">Module requis</p>}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
            <Button type="submit" variant="outline">{mode === "add" ? "Créer" : "Enregistrer"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
