import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import * as SiIcons from "react-icons/si";
import { tools } from "../data/tools.json";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ToolComments } from "./ToolComments";

export function ToolGrid() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTool, setSelectedTool] = useState<string | null>(null);

  const filteredTools = selectedCategory
    ? tools.filter(category => category.category === selectedCategory)
    : tools;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-2">
        <Button
          variant={selectedCategory === null ? "default" : "outline"}
          onClick={() => setSelectedCategory(null)}
          className="transition-all"
        >
          All Categories
        </Button>
        {tools.map(category => (
          <Button
            key={category.category}
            variant={selectedCategory === category.category ? "default" : "outline"}
            onClick={() => setSelectedCategory(category.category)}
            className="transition-all"
          >
            {category.category}
          </Button>
        ))}
      </div>

      <div className="grid gap-8">
        {filteredTools.map((category, index) => (
          <motion.section
            key={category.category}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <h2 className="text-2xl font-bold mb-4">{category.category}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {category.items.map((tool) => {
                const IconComponent = SiIcons[tool.icon as keyof typeof SiIcons];

                return (
                  <motion.div
                    key={tool.name}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card 
                      className="h-full hover:shadow-lg transition-shadow cursor-pointer"
                      onClick={() => setSelectedTool(tool.name)}
                    >
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          {IconComponent && <IconComponent className="h-6 w-6" />}
                          {tool.name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground">{tool.description}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </motion.section>
        ))}
      </div>

      {selectedTool && (
        <Dialog open={!!selectedTool} onOpenChange={() => setSelectedTool(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{selectedTool}</DialogTitle>
            </DialogHeader>
            <ToolComments toolName={selectedTool} />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}