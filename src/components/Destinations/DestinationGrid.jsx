import { useState, useRef, useMemo } from "react";
import axios from "axios";
import { Alert } from "../../utils/Alert";
import { Spinner } from "../../utils/Spinner";
import { useAuth } from "../../contexts/Auth";

const DestinationGrid = () => {
  const [items, setItems] = useState([]);
  const sliderRef = useRef(null);

  const { token, handleReload } = useAuth();

  const [loading, setLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [myalert, setAlert] = useState({
    type: "",
    message: "",
  });

  const displayMessage = (type, message) => {
    setShowAlert(true);
    setAlert({ type: type, message: message });
    setTimeout(() => {
      setShowAlert(false);
    }, 2000);
  };

  const scrollSlider = (direction) => {
    const slider = sliderRef.current;
    const scrollAmount = 275;
    slider.scrollBy({ left: direction * scrollAmount, behavior: "smooth" });
  };

  useMemo(() => {
    const getDestinations = async () => {
      const destinations = await axios.get(
        "http://localhost:5000/api/v1/destinations"
      );
      const reversedDestinations = destinations.data.allDestinations.reverse();
      setItems(reversedDestinations);
    };
    getDestinations();
  }, []);

  const handleDelete = async (e, id) => {
    e.preventDefault();
    try {
      const value = confirm("Do you want to delete Destination?");

      if (value) {
        setLoading(true);
        const url = `http://localhost:5000/api/v1/destinations/${id}`;
        const mytoken = "Bearer " + token;

        const response = await axios.delete(url, {
          headers: {
            Authorization: mytoken,
          },
        });

        if (
          response.data.status == 200 ||
          response.data.status == 201 ||
          response.data.status == "Successful"
        ) {
          displayMessage("success", response.data.message);
          setTimeout(() => {
            handleReload();
          }, 1000);
        }
      } else {
        displayMessage("danger", response.data.message);
        return;
      }
    } catch (error) {
      displayMessage("danger", "Internal Error Occured.");
    } finally {
      setLoading(false);
    }
  };


  if (loading) {
    return <Spinner />;
  } else {
    return (
      <>
        {showAlert && <Alert alert={myalert} />}
        <div className="mx-4 lg:mx-8 ">
          <div className="flex flex-col mx-2 text-center justify-center items-center mt-16">
            <h1 className="text-3xl mb-2">
              <b>Destinations</b>
            </h1>
            <hr className="mb-8 w-1/3" />
          </div>

          <div
            className="flex relative overflow-y-auto transition-transform"
            ref={sliderRef}
            style={{ scrollbarWidth: "none" }}
          >
            {items.map((item) => {
              return (
                <div key={item._id}>
                  <div className="flex relative justify-center size-64 mr-4">
                    <p
                      className="flex absolute right-2 top-2 bg-opacity-70 hover:bg-opacity-100 transition-opacity text-slate-100 bg-slate-600 cursor-pointer size-8 rounded-full text-center justify-center items-center"
                      onClick={(event) => {
                        handleDelete(event, item._id);
                      }}
                    >
                      &#10005;
                    </p>
                    <img
                      className="object-cover rounded-md"
                      src={"http://localhost:5000/" + item.images[0]}
                      alt=""
                    />
                    <div className="absolute bottom-0 rounded-b-md cursor-pointer text-slate-100 bg-slate-900 bg-opacity-60 p-4 w-full">
                      <h1 className="text-lg">
                        <b>{item.title}</b>
                      </h1>
                      <p className="text-xs">{item.description}</p>
                      <ul className="text-xs flex flex-row mt-2">
                        {item.tags.map((item, index) => {
                          return (
                            <li key={index} className="mr-2">
                              {item}
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="flex justify-center items-center text-slate-100 *:bg-opacity-40 *:bg-slate-900 hover:*:bg-slate-800 *:rounded-full *:px-4 *:py-2 *:mx-2 my-4 mb-16">
          <button className="prev" onClick={() => scrollSlider(-1)}>
            &#10094;
          </button>
          <button className="next" onClick={() => scrollSlider(1)}>
            &#10095;
          </button>
        </div>
      </>
    );
  }
};

export { DestinationGrid };