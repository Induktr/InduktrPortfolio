import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import * as SiIcons from "react-icons/si";
import { tools } from "../data/tools.json";

export function ToolGrid() {
  return (
    <div className="grid gap-8">
      {tools.map((category, index) => (
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
                <Card key={tool.name} className="hover:shadow-lg transition-shadow">
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
              );
            })}
          </div>
        </motion.section>
      ))}
    </div>
  );
}
