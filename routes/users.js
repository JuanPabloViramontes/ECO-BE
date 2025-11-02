// components/Users.js - VERSIÓN JAVASCRIPT
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Users as UsersIcon, 
  Search, 
  UserPlus, 
  MoreHorizontal, 
  Trash2, 
  Edit,
  Loader2
} from "lucide-react";
import CreateUserModal from "@/components/CreateUserModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [deletingUserId, setDeletingUserId] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (res.ok) {
        const usersData = await res.json();
        setUsers(usersData);
      } else {
        console.error('Error fetching users:', res.status);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUserCreated = (newUser) => {
    setUsers(prev => [...prev, newUser]);
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!confirm(`¿Estás seguro de que deseas eliminar al usuario "${userName}"? Esta acción no se puede deshacer.`)) {
      return;
    }

    try {
      setDeletingUserId(userId);
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/users/${userId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        // Eliminar el usuario de la lista localmente
        setUsers(prev => prev.filter(user => user._id !== userId));
        alert('Usuario eliminado exitosamente');
      } else {
        const errorData = await res.json();
        alert(errorData.message || 'Error al eliminar el usuario');
      }
    } catch (err) {
      console.error('Error deleting user:', err);
      alert('Error al eliminar el usuario');
    } finally {
      setDeletingUserId(null);
    }
  };

  // Filtrar usuarios basado en la búsqueda
  const filteredUsers = users.filter(user =>
    user.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.rol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="p-8 flex justify-center items-center min-h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">Cargando usuarios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Gestión de usuarios</h1>
          <p className="text-muted-foreground">
            Administra miembros del equipo para la plataforma de ECO
          </p>
        </div>
        <Button 
          className="bg-ocean-depth hover:opacity-90 text-white"
          onClick={() => setIsCreateModalOpen(true)}
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Agregar usuario
        </Button>
      </div>

      {/* Search and Filters */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar usuarios por nombre, email o rol..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button 
              variant="outline" 
              onClick={() => setSearchTerm("")}
            >
              Limpiar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <UsersIcon className="h-5 w-5 text-primary" />
            <span>Miembros del equipo ({filteredUsers.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredUsers.length === 0 ? (
              <div className="text-center py-12">
                <UsersIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No hay usuarios</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm ? 'No se encontraron usuarios que coincidan con la búsqueda.' : 'Aún no hay usuarios registrados.'}
                </p>
                {!searchTerm && (
                  <Button onClick={() => setIsCreateModalOpen(true)}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Agregar primer usuario
                  </Button>
                )}
              </div>
            ) : (
              filteredUsers.map((user) => (
                <div
                  key={user._id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-secondary/50 transition-colors group"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-full bg-ocean-depth text-white flex items-center justify-center font-medium">
                      {user.nombre?.charAt(0)?.toUpperCase() || user.email.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground">{user.nombre || 'Sin nombre'}</h3>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge 
                          variant="outline"
                          className="text-xs capitalize"
                        >
                          {user.rol}
                        </Badge>
                        <Badge 
                          variant={user.activo ? 'default' : 'secondary'}
                          className={`text-xs ${user.activo ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}
                        >
                          {user.activo ? 'activo' : 'inactivo'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">
                        Creado: {new Date(user.fechaCreacion).toLocaleDateString('es-MX')}
                      </p>
                    </div>
                    
                    {/* Dropdown Menu para acciones */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0 opacity-70 group-hover:opacity-100 transition-opacity"
                          disabled={deletingUserId === user._id}
                        >
                          {deletingUserId === user._id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <MoreHorizontal className="h-4 w-4" />
                          )}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem className="flex items-center gap-2">
                          <Edit className="h-4 w-4" />
                          Editar usuario
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="flex items-center gap-2 text-red-600 focus:text-red-600"
                          onClick={() => handleDeleteUser(user._id, user.nombre || user.email)}
                        >
                          <Trash2 className="h-4 w-4" />
                          Eliminar usuario
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <CreateUserModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onUserCreated={handleUserCreated}
      />
    </div>
  );
}