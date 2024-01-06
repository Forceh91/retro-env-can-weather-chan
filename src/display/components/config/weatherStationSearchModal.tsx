import {
  Button,
  FormControl,
  Heading,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Stack,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import axios from "lib/axios";
import { ChangeEvent, FormEvent, useState } from "react";
import { ECCCWeatherStation } from "types";

type WeatherStationSearchModalProps = {
  disabled: boolean;
  selectWeatherStation: (station: ECCCWeatherStation) => void;
};

export function WeatherStationSearchModal({ disabled, selectWeatherStation }: WeatherStationSearchModalProps) {
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [search, setSearch] = useState<string>();
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<Array<ECCCWeatherStation>>();

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => setSearch(e.target.value);
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    toast.closeAll();
    e.stopPropagation();
    e.preventDefault();

    if (isSearching || !search?.length) return;
    setIsSearching(true);

    axios
      .post("config/stations", { search })
      .then((resp) => {
        const {
          data: { results },
        } = resp;

        setResults(results);
      })
      .catch(() => toast({ title: "Unable to find stations", status: "error" }))
      .finally(() => setIsSearching(false));
  };

  const selectStation = (station: ECCCWeatherStation) => {
    onClose();
    selectWeatherStation(station);
  };

  const closeWeatherStationSearch = () => {
    setSearch(undefined);
    setResults(null);
    onClose();
  };

  return (
    <>
      <Button colorScheme="green" size={"sm"} onClick={onOpen} isDisabled={disabled}>
        Add Station
      </Button>

      <Modal isOpen={isOpen} onClose={closeWeatherStationSearch} isCentered size={"3xl"}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Weather Station Search</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <form onSubmit={onSubmit}>
              <FormControl>
                <Input value={search} onChange={handleSearchChange} placeholder="Search for city/town..." />
              </FormControl>
              <Button
                type="submit"
                mt={4}
                colorScheme="teal"
                isLoading={isSearching}
                isDisabled={!search || search.length < 3}
              >
                Search
              </Button>
            </form>

            {results && (
              <Stack spacing={6} mt={4}>
                <Heading as="h3" size="md">
                  Available weather stations
                </Heading>

                <TableContainer>
                  <Table variant="striped" size="sm">
                    <Thead>
                      <Tr>
                        <Th>Name</Th>
                        <Th>Province</Th>
                        <Th>Station Code</Th>
                        <Th></Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {results?.length ? (
                        results.map((result) => (
                          <Tr key={result.location}>
                            <Td>{result.name}</Td>
                            <Td>{result.province}</Td>
                            <Td>{result.location}</Td>
                            <Td>
                              <Button colorScheme="blue" size={"sm"} onClick={() => selectStation(result)}>
                                Select Station
                              </Button>
                            </Td>
                          </Tr>
                        ))
                      ) : (
                        <Tr>
                          <Td colSpan={4}>No stations were found</Td>
                        </Tr>
                      )}
                    </Tbody>
                  </Table>
                </TableContainer>
              </Stack>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}
