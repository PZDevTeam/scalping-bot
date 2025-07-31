import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
// import { CreateUserDto } from './dto/create-user.dto';

@ApiTags('пользователи')
@Controller('users')
export class AppController {
  @ApiOperation({ summary: 'Создание пользователя' })
  @ApiResponse({ status: 201, description: 'Пользователь успешно создан' })
  @ApiResponse({ status: 403, description: 'Запрещено' })
  @Post()
  create() {
    // реализация
  }

  @ApiOperation({ summary: 'Получить пользователя по ID' })
  @ApiParam({ name: 'id', type: 'number', description: 'ID пользователя' })
  @ApiResponse({ status: 200, description: 'Пользователь найден' })
  @ApiResponse({ status: 404, description: 'Пользователь не найден' })
  @Get(':id')
  findOne() {
    // реализация
  }
}
