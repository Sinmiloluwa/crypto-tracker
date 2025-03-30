import { Test, TestingModule } from '@nestjs/testing';
import { CryptoResolver } from './crypto.resolver';

describe('CryptoResolver', () => {
  let resolver: CryptoResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CryptoResolver],
    }).compile();

    resolver = module.get<CryptoResolver>(CryptoResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
